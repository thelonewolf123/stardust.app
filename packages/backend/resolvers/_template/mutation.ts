import gql from 'graphql-tag'

import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {}

export const mutationType = gql`
    type Mutation {
    }
`
