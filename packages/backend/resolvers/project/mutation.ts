import gql from 'graphql-tag'
import invariant from 'invariant'

import { ecr } from '@/core/ecr.aws'
import { getRegularUser } from '@/core/utils'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    async createProject(_, { input }, ctx) {
        const user = getRegularUser(ctx)
        const projectSlug = user.username + '/' + input.name

        const ecrResponse = await ecr.createEcrRepo({ name: projectSlug })
        const repositoryUri = ecrResponse.repository?.repositoryUri
        invariant(repositoryUri, 'Repository URI is not defined')

        ctx.queue.buildContainer.publish({
            projectSlug: projectSlug,
            githubRepoUrl: input.githubUrl,
            githubRepoBranch: input.githubBranch,
            dockerPath: input.dockerPath,
            dockerContext: input.dockerContext,
            ecrRepo: repositoryUri
        })

        const project = new ctx.db.Project({
            slug: projectSlug,
            name: input.name,
            description: input.description,
            githubUrl: input.githubUrl,
            githubBranch: input.githubBranch,
            dockerPath: input.dockerPath,
            dockerContext: input.dockerContext,
            ecrRepo: repositoryUri,
            user: user
        })
        await project.save()

        return projectSlug
    }
}

export const mutationType = gql`
    type Mutation {
        createProject(input: ProjectInput!): String!
    }
`
