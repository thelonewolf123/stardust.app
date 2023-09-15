import gql from 'graphql-tag'
import invariant from 'invariant'

import { Resolvers } from '@/types/graphql-server'

export const query: Resolvers['Query'] = {
    async getContainerInfo(_, { slug }, ctx) {
        const container = await ctx.db.Container.findOne({
            containerSlug: slug
        }).lean()
        invariant(container, 'Container not found')
        return container
    },
    async getAllContainers(_, __, ctx) {
        const user = ctx.user
        const containers = await ctx.db.Container.find({
            createdBy: user
        }).lean()
        return containers
    }
}

export const queryType = gql`
    type Query {
        getContainerInfo(slug: String!): Container!
        getAllContainers: [Container!]!
    }
`
