import { Express } from 'express'
import gql from 'graphql-tag'

import { Context } from '@/types'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

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
    context: async ({ req, res }) => ({
        authScope: req.headers.authorization
    })
}).then(({ url }) => {
    console.log(`🚀 Server listening at: ${url}`)
})
