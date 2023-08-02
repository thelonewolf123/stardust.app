import mongoose, { connect, Connection } from 'mongoose'

import { env } from '../../env'

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: {
    conn?: typeof mongoose | null
    promise?: Promise<typeof mongoose> | null
} = { conn: null, promise: null }

export async function dbConnect() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false
        }

        cached.promise = mongoose
            .connect(env.MONGODB_URI, opts)
            .then((mongoose) => {
                return mongoose
            })
    }

    cached.conn = await cached.promise
    return cached.conn
}
