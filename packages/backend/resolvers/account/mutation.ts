import gql from 'graphql-tag'

import { User } from '@/backend/database/models/user'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    signup: async (_, { username, email, password }, ctx) => {
        const isUserTaken = await User.count({
            $or: [{ username: username }, { email: email }]
        })
        if (isUserTaken) {
            throw new Error('Username/email is already taken')
        }

        const user = await User.create({
            username,
            email,
            password
        })

        return {
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.getMilliseconds()
        }
    }
}

export const mutationType = gql`
    type Mutation {
        signup(username: String!, email: String!, password: String!): User!
    }
`
