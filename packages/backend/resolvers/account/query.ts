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
    }
}

export const queryType = gql`
    type Query {
        logout: Boolean!
    }
`
