import jwt from 'jsonwebtoken'

import { env } from '@/env'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

import { User } from './database/models/user'
import { dbConnect } from './database/mongoose'
import containerSchema from './resolvers/container'

const server = new ApolloServer({
    typeDefs: mergeTypeDefs([...containerSchema.typeDefs]),
    resolvers: mergeResolvers([containerSchema.resolvers])
})

server.addPlugin({
    async serverWillStart() {
        console.log('Server starting up!')
        await dbConnect()
    }
})

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const token = req.headers['x-access-token']

        if (!token) return { user: null }

        try {
            const { username, count } = await new Promise<{
                username: string
                count: number
            }>((resolve, reject) => {
                jwt.verify(`${token}`, env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return reject(err)
                    }

                    if (!decoded) return reject('No decoded token')

                    if (typeof decoded === 'string')
                        return reject('Decoded token is string')

                    resolve(decoded.username)
                })
            })

            const user = await User.findOne({ username })

            if (!user) return { user: null }
            if (user.count !== count) return { user: null }

            return { user }
        } catch (err) {
            console.log(err)
        }

        return {
            user: null
        }
    }
}).then(({ url }) => {
    console.log(`🚀 Server listening at: ${url}`)
})
