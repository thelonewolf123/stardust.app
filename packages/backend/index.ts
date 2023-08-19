import jwt from 'jsonwebtoken'

import { createQueue, getClient } from '@/core/queue'
import { env } from '@/env'
import { Context } from '@/types'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import {
    BUILD_CONTAINER,
    DESTROY_CONTAINER,
    NEW_CONTAINER
} from '@constants/queue'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

import models from './database/models'
import { connect } from './database/mongoose'
import accountSchema from './resolvers/account'
import containerSchema from './resolvers/container'
import projectSchema from './resolvers/project'

const server = new ApolloServer({
    typeDefs: mergeTypeDefs([
        ...containerSchema.typeDefs,
        ...accountSchema.typeDefs,
        ...projectSchema.typeDefs
    ]),
    resolvers: mergeResolvers([
        containerSchema.resolvers,
        accountSchema.resolvers,
        projectSchema.resolvers
    ])
})

let queuePromise: [
    Awaited<ReturnType<typeof createQueue>>,
    Awaited<ReturnType<typeof createQueue>>,
    Awaited<ReturnType<typeof createQueue>>
]

server.addPlugin({
    async serverWillStart() {
        console.log('Server starting up!')
        await connect()

        const client = await getClient()
        queuePromise = await Promise.all([
            createQueue(client, {
                exchange: NEW_CONTAINER.EXCHANGE_NAME,
                queue: NEW_CONTAINER.QUEUE_NAME,
                routingKey: NEW_CONTAINER.ROUTING_KEY
            }),
            createQueue(client, {
                exchange: DESTROY_CONTAINER.EXCHANGE_NAME,
                queue: DESTROY_CONTAINER.QUEUE_NAME,
                routingKey: DESTROY_CONTAINER.ROUTING_KEY
            }),
            createQueue(client, {
                exchange: BUILD_CONTAINER.EXCHANGE_NAME,
                queue: BUILD_CONTAINER.QUEUE_NAME,
                routingKey: BUILD_CONTAINER.ROUTING_KEY
            })
        ])
    }
})

startStandaloneServer(server, {
    listen: { port: 4000, path: '/graphql' },
    context: async ({ req, res }) => {
        const token = req.headers['x-access-token']
        const [createContainer, destroyContainer, buildContainer] =
            await queuePromise

        const ctx: Context = {
            queue: {
                createContainer,
                destroyContainer,
                buildContainer
            },
            db: models,
            user: null
        }

        if (!token) return ctx

        try {
            const { username, count } = await new Promise<{
                username: string
                count: number
            }>((resolve, reject) => {
                jwt.verify(`${token}`, env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return reject(err)
                    }

                    if (typeof decoded === 'string')
                        return reject('Decoded token is string')

                    if (!decoded || !decoded.exp)
                        return reject('No decoded token')

                    if (decoded.exp < Date.now() / 1000)
                        return reject('Token expired')

                    resolve(decoded as any)
                })
            })

            const user = await models.User.findOne({ username }).lean()

            ctx.user = user && user.count === count ? (user as any) : null

            return ctx
        } catch (err) {
            console.log(err)
        }

        return ctx
    }
}).then(({ url }) => {
    console.log(`🚀 Server listening at: ${url}`)
})
