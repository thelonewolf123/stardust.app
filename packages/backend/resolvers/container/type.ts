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
        ecrRepo: String!
        command: [String!]
        port: Int
        env: [EnvInput!]
        metaData: [metaDataInput!]
    }

    enum ContainerStatus {
        pending
        running
        failed
        checkpoint
        terminated
    }

    type Env {
        name: String!
        value: String!
    }

    type metaData {
        name: String!
        value: String!
    }

    type Container {
        containerSlug: String!
        image: String!
        command: [String!]
        port: Int
        env: [Env!]
        metaData: [metaData!]
        status: ContainerStatus!
    }
`
