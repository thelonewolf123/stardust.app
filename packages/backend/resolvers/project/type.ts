import gql from 'graphql-tag'

export const typeDefs = gql`
    input ProjectInput {
        name: String!
        description: String!
        githubUrl: String!
        githubBranch: String!
        dockerPath: String!
        dockerContext: String!
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
