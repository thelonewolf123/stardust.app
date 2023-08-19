import gql from 'graphql-tag'
import { v4 } from 'uuid'

import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    createProject(_, { input }, ctx) {
        const projectSlug = v4()
        ctx.buildContainerQueue.publish({
            projectSlug: projectSlug,
            githubRepoUrl: input.githubUrl,
            githubRepoBranch: input.githubBranch,
            dockerPath: input.dockerPath,
            dockerContext: input.dockerContext,
            ecrRepo: 'test'
        })

        return 'Hello World!'
    }
}

export const mutationType = gql`
    type Mutation {
        createProject(input: ProjectInput!): String!
    }
`
