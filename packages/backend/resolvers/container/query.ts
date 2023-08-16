import gql from 'graphql-tag'

import { Resolvers } from '@/types/graphql-server'

export const query: Resolvers['Query'] = {}

export const queryType = gql`
    type Query {
        containerStatus(slug: String!): ContainerStatus!
    }
`
