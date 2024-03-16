import gql from 'graphql-tag'
import invariant from 'invariant'

import { generateSubdomain } from '@/backend/library'
import { ecr } from '@/core/aws/ecr.aws'
import { getRegularUser } from '@/core/utils'
import { env } from '@/env'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    async createProject(_, { input, start }, ctx) {
        const user = getRegularUser(ctx)
        const version = 0
        const projectSlug = user.username + '/' + input.name
        const containerSlug = `${projectSlug}:${version}`

        const ecrResponse = await ecr.createEcrRepo({ name: projectSlug })
        const repositoryUri = ecrResponse.repository?.repositoryUri
        invariant(repositoryUri, 'Repository URI is not defined')
        const repoWithHash = `${repositoryUri}:${version}`

        const prefix = generateSubdomain()
        const subdomain = `${prefix}.${env.DOMAIN_NAME}`

        const buildArgs = (input.buildArgs || []).reduce(
            (acc, { name, value }) => {
                acc[name] = value
                return acc
            },
            {} as Record<string, string>
        )

        if (start) {
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
        }

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
            domains: [subdomain],
            user: user
        })
        await project.save()

        return containerSlug
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
                containerId: current.containerId,
                containerSlug: current.containerSlug
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

        const container: any = project.history.find((c: any) => {
            return c.version === version
        })

        invariant(container, 'Container not found')

        const currentContainer = project.current as any
        invariant(currentContainer, 'Current container not found')

        const history = project.history
        const containerSlug = `${slug}:${history.length}`

        ctx.queue.destroyContainer.publish({
            containerId: currentContainer.containerId,
            containerSlug: currentContainer.containerSlug
        })

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
            {
                $push: { history: newContainer },
                $set: { current: newContainer }
            }
        )

        ctx.queue.createContainer.publish({
            containerSlug: containerSlug,
            env: container.env.reduce(
                (
                    acc: Record<string, string>,
                    { name, value }: { name: string; value: string }
                ) => {
                    acc[name] = value
                    return acc
                },
                {} as Record<string, string>
            ),
            image: container.image,
            ports: container.port ? [container.port] : []
        })

        return true
    },
    refreshProject: async (_, { slug, input, start, type }, ctx) => {
        const user = getRegularUser(ctx)

        const project = await ctx.db.Project.findOne({ slug, user: user._id })
            .populate(['current'])
            .lean()
        invariant(project, 'Project not found')

        const current: any = project.current
        invariant(current, 'Current container not found')
        const buildArgs = (input.buildArgs || current.buildArgs || []).reduce(
            (
                acc: any,
                {
                    name,
                    value
                }: {
                    name: string
                    value: string
                }
            ) => {
                acc[name] = value
                return acc
            },
            {} as Record<string, string>
        )

        const history = project.history
        const containerSlug = `${slug}:${history.length}`
        const repoWithHash = `${project.ecrRepo}:${history.length}`

        if (type === 'edit') {
            ctx.queue.destroyContainer.publish({
                containerId: current.containerId,
                containerSlug: current.containerSlug
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
                        name: input.name || project.name,
                        description: input.description || project.description,
                        current: newContainer,
                        githubUrl: input.githubUrl || project.githubUrl,
                        githubBranch:
                            input.githubBranch || project.githubBranch,
                        dockerPath: input.dockerPath || project.dockerPath,
                        dockerContext:
                            input.dockerContext || project.dockerContext,
                        ecrRepo: project.ecrRepo
                    }
                }
            )
        } else {
            await ctx.db.Project.updateOne(
                { slug, user: user._id },
                {
                    $set: {
                        name: input.name || project.name,
                        description: input.description || project.description,
                        githubUrl: input.githubUrl || project.githubUrl,
                        githubBranch:
                            input.githubBranch || project.githubBranch,
                        dockerPath: input.dockerPath || project.dockerPath,
                        dockerContext:
                            input.dockerContext || project.dockerContext
                    }
                }
            )

            const current = await ctx.db.Container.findOne({
                _id: project.current._id
            })
            invariant(current, 'Current container not found')
            current.env = input.env || current.env
            current.metaData = input.metaData || current.metaData
            current.port = input.port || current.port
            current.buildArgs = input.buildArgs || current.buildArgs
            await current.save()
        }

        if (start) {
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
        }

        return true
    },
    addDomain: async (_, { slug, domain }, ctx) => {
        const user = getRegularUser(ctx)
        const project = await ctx.db.Project.findOne({ slug, user: user._id })
        if (!project) throw new Error('Project not found')

        project.domains.push(domain)
        await project.save()
        return true
    },
    removeDomain: async (_, { slug, domain }, ctx) => {
        const user = getRegularUser(ctx)
        const project = await ctx.db.Project.findOne({ slug, user: user._id })
        if (!project) throw new Error('Project not found')

        project.domains = project.domains.filter((d) => d !== domain)
        await project.save()
        return true
    }
}

export const mutationType = gql`
    type Mutation {
        createProject(input: ProjectInput!, start: Boolean!): String!
        deleteProject(slug: String!): Boolean!
        roleBackProject(slug: String!, version: Int!): Boolean!
        refreshProject(
            slug: String!
            input: RefreshProjectInput!
            start: Boolean!
            type: String!
        ): Boolean!
        addDomain(slug: String!, domain: String!): Boolean!
        removeDomain(slug: String!, domain: String!): Boolean!
    }
`
