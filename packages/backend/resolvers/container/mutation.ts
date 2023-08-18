import gql from 'graphql-tag'
import { v4 } from 'uuid'

import { getRegularUser } from '@/core/utils'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    async createContainer(_, { input }, ctx) {
        getRegularUser(ctx)
        const containerSlug = v4()

        ctx.createContainerQueue.publish({
            containerSlug,
            image: input.image,
            command: input.command ?? []
        })

        return true
    }
}

export const mutationType = gql`
    type Mutation {
        createContainer(input: ContainerInput!): Boolean!
        deleteContainer(slug: String!): Boolean!
    }
`
