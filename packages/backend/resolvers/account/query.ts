import gql from 'graphql-tag'

import { Resolvers } from '@/types/graphql-server'

export const query: Resolvers['Query'] = {
    logout: async (_, __, ctx) => {
        // You can perform some operations here, like updating the logged out time in the database
        const user = ctx.user
        if (!user) throw new Error('User not found')

        // Destroy the session
        await ctx.db.User.updateOne(
            {
                username: user.username,
                updatedAt: new Date()
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
