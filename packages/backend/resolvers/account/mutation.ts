import crypto from 'crypto'
import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'

import { env } from '@/env'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    signup: async (_, { username, email, password }, ctx) => {
        const isValidUsername = /^[a-zA-Z0-9_]+$/.test(username)
        const isValidEmail =
            /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)

        if (!isValidUsername || !isValidEmail) {
            throw new Error('Invalid username/email')
        }

        const isUserTaken = await ctx.db.User.count({
            $or: [{ username: username }, { email: email }]
        })
        if (isUserTaken) {
            throw new Error('Username/email is already taken')
        }

        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex')

        await ctx.db.User.create({
            username,
            email,
            password: hashedPassword
        })

        const token = jwt.sign({ username, count: 0 }, env.JWT_SECRET, {
            expiresIn: '60h'
        })
        return token
    }
}

export const mutationType = gql`
    type Mutation {
        signup(username: String!, email: String!, password: String!): String!
    }
`
