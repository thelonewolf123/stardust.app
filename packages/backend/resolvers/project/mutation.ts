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

        const buildArgs: Record<string, string> = {}
        input.buildArgs?.map(({ name, value }) => {
            buildArgs[name] = value
        })

        ctx.queue.buildContainer.publish({
            containerSlug,
            projectSlug: projectSlug,
            githubRepoUrl: input.githubUrl,
            githubRepoBranch: input.githubBranch,
            dockerPath: input.dockerPath,
            dockerContext: input.dockerContext,
            ecrRepo: repositoryUri,
            buildArgs,
            version
        })

        const container = new ctx.db.Container({
            containerSlug,
            env: input.env,
            metaData: input.metaData,
            port: input.port,
            status: 'pending',
            image: `${repositoryUri}:${version}`,
            version,
            createdBy: user
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
    }
}

export const mutationType = gql`
    type Mutation {
        createProject(input: ProjectInput!): String!
        deleteProject(slug: String!): Boolean!
    }
`
