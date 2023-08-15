import gql from 'graphql-tag'

export const typeDefs = gql`
    type Container {
        id: ID!
        name: String!
        description: String!
        image: String!
        price: Float!
    }
`
