import gql from 'graphql-tag'

export const typeDefs = gql`
    input EnvInput {
        name: String!
        value: String!
    }

    input ContainerInput {
        description: String!
        image: String!
        command: [String!]
        port: String
        env: [EnvInput!]
    }

    enum ContainerStatus {
        running
        stopped
        pending
    }
`
