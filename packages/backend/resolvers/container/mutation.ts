import gql from 'graphql-tag'
import invariant from 'invariant'
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
            image: input.ecrRepo,
            command: input.command ?? [],
            env,
            ports: input.port ? [input.port] : []
        })

        return true
    },
    async deleteContainer(_, { containerId }, ctx) {
        getRegularUser(ctx)
        const container = await ctx.db.Container.findOne({
            containerId,
            createdBy: ctx.user?._id
        }).lean()

        invariant(container, 'Container not found')

        ctx.queue.destroyContainer.publish({
            containerId
        })
        return true
    }
}

export const mutationType = gql`
    type Mutation {
        createContainer(input: ContainerInput!): Boolean!
        deleteContainer(containerId: String!): Boolean!
    }
`
