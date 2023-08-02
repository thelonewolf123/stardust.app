import { connect, Connection } from 'mongoose'

import { env } from '../../env'

let connection: Connection

const connectToMongoDB = (): void => {
    connect(env.MONGODB_URI, {})
        .then((client) => {
            connection = client.connection
            console.log('Connected to MongoDB')
        })
        .catch((err) => console.error('Error connecting to MongoDB:', err))
}

export { connectToMongoDB, connection }
