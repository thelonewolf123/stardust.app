import gql from 'graphql-tag'

import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    createProject: async (_, { input }, ctx) => {
        console.log(input, ctx)
        return true
    }
}

export const mutationType = gql`
    type Mutation {
        createProject(input: String!): Boolean!
    }
`
