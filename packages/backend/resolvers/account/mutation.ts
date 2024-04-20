import crypto from 'crypto'
import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'

import { env } from '@/env'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    signupOrLogin: async (
        _,
        { username, email, token, backend_token },
        ctx
    ) => {
        const isValidUsername = /^[a-zA-Z0-9_]+$/.test(username)
        const isValidEmail =
            /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)

        if (!isValidUsername || !isValidEmail) {
            throw new Error('Invalid username/email')
        }

        if (backend_token !== env.BACKEND_TOKEN) {
            throw new Error('Invalid backend token')
        }

        const existingUser = await ctx.db.User.findOne({
            username,
            email
        }).lean()

        if (existingUser) {
            const access_token = jwt.sign(
                { username, count: existingUser.count },
                env.JWT_SECRET,
                {
                    expiresIn: '60h'
                }
            )
            return access_token
        }

        await ctx.db.User.create({
            username,
            github_access_token: token,
            email
        })

        const access_token = jwt.sign({ username, count: 0 }, env.JWT_SECRET, {
            expiresIn: '60h'
        })
        return access_token
    }
}

export const mutationType = gql`
    type Mutation {
        signupOrLogin(
            username: String!
            email: String!
            token: String!
            backend_token: String!
        ): String!
    }
`
