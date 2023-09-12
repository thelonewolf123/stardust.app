import { env } from '@/env'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

export function getApolloClient() {
    const client = new ApolloClient({
        uri: env.BACKEND_BASE_URL,
        cache: new InMemoryCache(),
        headers: {
            'x-access-token': process.env.ACCESS_TOKEN || ''
        }
    })
    return client
}
