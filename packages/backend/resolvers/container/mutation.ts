import gql from 'graphql-tag'
import { v4 } from 'uuid'

import { getRegularUser } from '@/core/utils'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    async createContainer(_, { input }, ctx) {
        getRegularUser(ctx)
        const containerSlug = v4()

        const env: Record<string, string> = {}
        input.env?.forEach((envron) => {
            env[envron.name] = envron.value
        })

        ctx.queue.createContainer.publish({
            containerSlug,
            image: input.image,
            command: input.command ?? [],
            env,
            ports: input.port ? [input.port] : []
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
