import gql from 'graphql-tag'

export const typeDefs = gql`
    input EnvInput {
        name: String!
        value: String!
    }

    input metaDataInput {
        name: String!
        value: String!
    }

    input ContainerInput {
        description: String!
        image: String!
        command: [String!]
        port: String
        env: [EnvInput!]
        metaData: [metaDataInput!]
    }

    enum ContainerStatus {
        running
        stopped
        pending
    }
`
