import crypto from 'crypto'
import gql from 'graphql-tag'
import invariant from 'invariant'
import jwt from 'jsonwebtoken'

import { getRegularUser } from '@/core/utils'
import { env } from '@/env'
import { Resolvers } from '@/types/graphql-server'

// Get the JWT_SECRET from environment variables
const JWT_SECRET = env.JWT_SECRET

export const query: Resolvers['Query'] = {
    login: async (_, { username, password }, ctx) => {
        // You should have proper authentication and validation here
        // For the sake of this example, let's assume username and password are valid

        // Hash the password using crypto
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex')

        const user = await ctx.db.User.findOne({
            username,
            password: hashedPassword
        })

        if (!user) {
            throw new Error('User not found')
        }

        await ctx.db.User.updateOne(
            {
                username,
                password: hashedPassword
            },
            {
                $inc: {
                    count: 1
                }
            }
        )

        // You might perform a database lookup to verify the username and hashed password

        // Generate a JWT token
        const token = jwt.sign(
            { username, count: user.count + 1 },
            JWT_SECRET,
            {
                expiresIn: '60h'
            }
        )
        return token
    },
    logout: async (_, __, ctx) => {
        // You can perform some operations here, like updating the logged out time in the database
        const user = ctx.user
        if (!user) throw new Error('User not found')

        // Destroy the session
        await ctx.db.User.updateOne(
            {
                username: user.username
            },
            {
                $inc: {
                    count: 1
                }
            }
        )

        return true
    },
    async getGithubUsername(_, __, ctx) {
        const user = getRegularUser(ctx)
        invariant(user.github_access_token, "github wasn't connected!")

        return user.github_access_token
    }
}

export const queryType = gql`
    type Query {
        login(username: String!, password: String!): String!
        logout: Boolean!
        getGithubUsername: String!
    }
`
