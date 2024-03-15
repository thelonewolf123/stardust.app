import gql from 'graphql-tag'
import invariant from 'invariant'

import { ProjectModel } from '@/backend/database/models/project'
import { git } from '@/backend/library/github'
import { getRegularUser } from '@/core/utils'
import { Project, Resolvers } from '@/types/graphql-server'
import { DocumentType } from '@typegoose/typegoose'

export const query: Resolvers['Query'] = {
    async getProjectBySlug(_, { slug }, ctx) {
        const user = getRegularUser(ctx)

        const project = (await ProjectModel.findOne(
            { slug, user: user._id },
            {
                history: 1,
                name: 1,
                slug: 1,
                createdAt: 1,
                updatedAt: 1,
                current: 1,
                description: 1,
                githubUrl: 1,
                githubBranch: 1,
                dockerPath: 1,
                dockerContext: 1
            }
        )
            .populate(['current', 'history'])
            .lean()) as DocumentType<Project>

        if (!project) throw new Error('Project not found')

        return project
    },
    async getAllProjects(_, __, ctx) {
        const user = getRegularUser(ctx)

        const projects = (await ProjectModel.find(
            { user: user._id },
            {
                history: 1,
                name: 1,
                slug: 1,
                createdAt: 1,
                updatedAt: 1,
                current: 1,
                description: 1,
                githubUrl: 1,
                githubBranch: 1,
                dockerPath: 1,
                dockerContext: 1
            }
        )
            .populate(['current', 'history'])
            .lean()) as DocumentType<Project>[]

        return projects
    },
    async getNotRunningProjects(_, __, ctx) {
        const user = getRegularUser(ctx)

        const projects = (await ProjectModel.find(
            { user: user._id, 'current.status': { $ne: 'running' } },
            {
                history: 1,
                name: 1,
                slug: 1,
                createdAt: 1,
                updatedAt: 1,
                current: 1,
                description: 1,
                githubUrl: 1,
                githubBranch: 1,
                dockerPath: 1,
                dockerContext: 1
            }
        )
            .populate(['current', 'history'])
            .lean()) as DocumentType<Project>[]

        return projects
    },

    async getRunningProjects(_, __, ctx) {
        const user = getRegularUser(ctx)

        const projects = (await ProjectModel.find(
            { user: user._id, 'current.status': 'running' },
            {
                history: 1,
                name: 1,
                slug: 1,
                createdAt: 1,
                updatedAt: 1,
                current: 1,
                description: 1,
                githubUrl: 1,
                githubBranch: 1,
                dockerPath: 1,
                dockerContext: 1
            }
        )
            .populate(['current', 'history'])
            .lean()) as DocumentType<Project>[]
        return projects
    },
    async getAllGithubRepos(_, __, ctx) {
        const user = getRegularUser(ctx)
        invariant(
            user.github_access_token && user.github_username,
            "github wasn't connected!"
        )
        const client = git(user.github_username, user.github_access_token)
        return client.listRepositories()
    },
    async getAllGithubBranches(_, { repo }, ctx) {
        const user = getRegularUser(ctx)
        invariant(
            user.github_access_token && user.github_username,
            "github wasn't connected!"
        )
        const client = git(user.github_username, user.github_access_token)
        return client.listBranches(repo)
    }
}

export const queryType = gql`
    type Query {
        getProjectBySlug(slug: String!): Project!
        getAllProjects: [Project!]!
        getNotRunningProjects: [Project!]!
        getRunningProjects: [Project!]!
        getAllGithubRepos: [String!]!
        getAllGithubBranches(repo: String!): [String!]!
    }
`
