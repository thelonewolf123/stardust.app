import gql from 'graphql-tag'

import { ProjectModel } from '@/backend/database/models/project'
import { getRegularUser } from '@/core/utils'
import { Project, Resolvers } from '@/types/graphql-server'
import { DocumentType } from '@typegoose/typegoose'

export const query: Resolvers['Query'] = {
    async getProjectBySlug(_, { slug }, ctx) {
        getRegularUser(ctx)

        const project = (await ProjectModel.findOne(
            { slug, userId: ctx.user?._id },
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

        console.log(project)

        return project
    }
}

export const queryType = gql`
    type Query {
        getProjectBySlug(slug: String!): Project!
    }
`
