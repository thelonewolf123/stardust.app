import gql from 'graphql-tag'
import invariant from 'invariant'

import { getRegularUser } from '@/core/utils'
import { Resolvers } from '@/types/graphql-server'

export const query: Resolvers['Query'] = {
    async getContainerInfo(_, { slug }, ctx) {
        const container = await ctx.db.Container.findOne({
            containerSlug: slug
        }).lean()

        invariant(container, 'Container not found')
        return {
            ...container,
            createdAt: container.createdAt.getTime(),
            updatedAt: container.updatedAt.getTime(),
            terminatedAt: container.terminatedAt?.getTime()
        }
    },
    async getAllContainers(_, __, ctx) {
        const user = ctx.user
        const containers = await ctx.db.Container.find({
            createdBy: user
        }).lean()
        return containers.map((container) => ({
            ...container,
            createdAt: container.createdAt.getTime(),
            updatedAt: container.updatedAt.getTime(),
            terminatedAt: container.terminatedAt?.getTime()
        }))
    },
    async getBuildLogs(_, { containerSlug }, ctx) {
        getRegularUser(ctx)
        const container = await ctx.db.Container.findOne({
            containerSlug,
            createdBy: ctx.user?._id
        }).lean()

        invariant(container, 'Container not found')

        return container.containerBuildLogs
    }
}

export const queryType = gql`
    type Query {
        getContainerInfo(slug: String!): Container!
        getAllContainers: [Container!]!
        getBuildLogs(containerSlug: String!): [String!]!
    }
`
