import gql from 'graphql-tag'

export const typeDefs = gql`
    input BuildArgsInput {
        name: String!
        value: String!
    }

    input ProjectInput {
        name: String!
        description: String!
        githubUrl: String!
        githubBranch: String!
        dockerPath: String!
        dockerContext: String!
        buildArgs: [BuildArgsInput!]
        port: Int
        env: [Env!]
        metaData: [metaData!]
    }

    type Project {
        slug: String!
        name: String!
        current: Container
        description: String!
        githubUrl: String!
        githubBranch: String!
        dockerPath: String!
        dockerContext: String!
        createdAt: Float!
        history: [Container!]
    }
`
