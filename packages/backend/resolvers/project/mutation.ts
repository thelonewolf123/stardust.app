import gql from 'graphql-tag'
import invariant from 'invariant'

import { ecr } from '@/core/aws/ecr.aws'
import { getRegularUser } from '@/core/utils'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    async createProject(_, { input }, ctx) {
        const user = getRegularUser(ctx)
        const version = 0
        const projectSlug = user.username + '/' + input.name
        const containerSlug = `${projectSlug}:${version}`

        const ecrResponse = await ecr.createEcrRepo({ name: projectSlug })
        const repositoryUri = ecrResponse.repository?.repositoryUri
        invariant(repositoryUri, 'Repository URI is not defined')
        const repoWithHash = `${repositoryUri}:${version}`

        const buildArgs = (input.buildArgs || []).reduce(
            (acc, { name, value }) => {
                acc[name] = value
                return acc
            },
            {} as Record<string, string>
        )

        ctx.queue.buildContainer.publish({
            containerSlug,
            projectSlug: projectSlug,
            githubRepoUrl: input.githubUrl,
            githubRepoBranch: input.githubBranch,
            dockerPath: input.dockerPath,
            dockerContext: input.dockerContext,
            ecrRepo: repoWithHash,
            buildArgs,
            version
        })

        const container = new ctx.db.Container({
            containerSlug,
            env: input.env,
            metaData: input.metaData,
            port: input.port,
            status: 'pending',
            image: repoWithHash,
            version,
            createdBy: user,
            buildArgs: input.buildArgs || []
        })
        await container.save()

        const project = new ctx.db.Project({
            slug: projectSlug,
            name: input.name,
            description: input.description,
            githubUrl: input.githubUrl,
            githubBranch: input.githubBranch,
            dockerPath: input.dockerPath,
            dockerContext: input.dockerContext,
            ecrRepo: repositoryUri,
            current: container,
            history: [container],
            user: user
        })
        await project.save()

        return projectSlug
    },
    deleteProject: async (_, { slug }, ctx) => {
        const user = getRegularUser(ctx)
        const project = await ctx.db.Project.findOne({ slug, user: user._id })
            .populate(['history'])
            .lean()
        if (!project) throw new Error('Project not found')

        const current = await ctx.db.Container.findOne({
            _id: project.current
        }).lean()

        await ctx.db.Container.deleteMany({
            containerSlug: { $regex: `^${slug}:` }
        })

        await ctx.db.Project.deleteOne({ slug, user: user._id })
        await ecr.deleteEcrRepo({ name: slug })

        if (current && current.containerId) {
            ctx.queue.destroyContainer.publish({
                containerId: current.containerId
            })
        }

        return true
    },
    roleBackProject: async (_, { slug, version }, ctx) => {
        const user = getRegularUser(ctx)
        const project = await ctx.db.Project.findOne({ slug, user: user._id })
            .populate(['history', 'current'])
            .lean()
        if (!project) throw new Error('Project not found')

        const container = project.history.find((c) => {
            if (c instanceof ctx.db.Container) {
                return c.version === version
            }
            return false
        })

        invariant(container, 'Container not found')

        await ctx.db.Project.updateOne(
            { slug, user: user._id },
            { $set: { current: container } }
        )
        const currentContainer = getContainerObj(project.current)
        invariant(currentContainer, 'Current container not found')

        const containerSlug = `${slug}:${history.length}`

        invariant(
            currentContainer instanceof ctx.db.Container,
            'Container not found'
        )

        ctx.queue.destroyContainer.publish({
            containerId: currentContainer.containerId
        })

        invariant(container instanceof ctx.db.Container, 'Container not found')

        const newContainer = new ctx.db.Container({
            containerSlug: containerSlug,
            env: container.env,
            metaData: container.metaData,
            port: container.port,
            status: 'pending',
            image: container.image,
            version: history.length,
            createdBy: user
        })
        await newContainer.save()
        await ctx.db.Project.updateOne(
            { slug, user: user._id },
            { $push: { history: newContainer } }
        )

        ctx.queue.createContainer.publish({
            containerSlug: containerSlug,
            env: container.env.reduce((acc, { name, value }) => {
                acc[name] = value
                return acc
            }, {} as Record<string, string>),
            image: container.image,
            ports: container.port ? [container.port] : []
        })

        return true
    },
    refreshProject: async (_, { input }, ctx) => {
        const user = getRegularUser(ctx)
        const slug = input.name

        const project = await ctx.db.Project.findOne({ slug, user: user._id })
            .populate(['current'])
            .lean()
        invariant(project, 'Project not found')

        const current = project.current
        invariant(current, 'Current container not found')

        if (!(current instanceof ctx.db.Container)) {
            invariant(false, 'Current container not found')
        }

        const containerSlug = `${slug}:${history.length}`
        const repoWithHash = `${project.ecrRepo}:${history.length}`

        const buildArgs = (input.buildArgs || current.buildArgs).reduce(
            (acc, { name, value }) => {
                acc[name] = value
                return acc
            },
            {} as Record<string, string>
        )

        ctx.queue.destroyContainer.publish({
            containerId: current.containerId
        })

        const newContainer = new ctx.db.Container({
            containerSlug: containerSlug,
            env: input.env ? input.env : current.env,
            buildArgs: input.buildArgs || current.buildArgs,
            metaData: input.metaData ? input.metaData : current.metaData,
            port: input.port || current.port,
            status: 'pending',
            image: repoWithHash,
            version: history.length,
            createdBy: user
        })
        await newContainer.save()
        await ctx.db.Project.updateOne(
            { slug, user: user._id },
            {
                $push: { history: newContainer },
                $set: {
                    current: newContainer,
                    githubUrl: input.githubUrl || project.githubUrl,
                    githubBranch: input.githubBranch || project.githubBranch,
                    dockerPath: input.dockerPath || project.dockerPath,
                    dockerContext: input.dockerContext || project.dockerContext,
                    ecrRepo: project.ecrRepo
                }
            }
        )

        ctx.queue.buildContainer.publish({
            containerSlug,
            projectSlug: slug,
            githubRepoUrl: input.githubUrl || project.githubUrl,
            githubRepoBranch: input.githubBranch || project.githubBranch,
            dockerPath: input.dockerPath || project.dockerPath,
            dockerContext: input.dockerContext || project.dockerContext,
            ecrRepo: repoWithHash,
            buildArgs,
            version: history.length
        })

        return true
    }
}

export const mutationType = gql`
    type Mutation {
        createProject(input: ProjectInput!): String!
        deleteProject(slug: String!): Boolean!
        roleBackProject(slug: String!, version: Int!): Boolean!
        refreshProject(input: RefreshProjectInput!): Boolean!
    }
`
