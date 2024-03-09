// https://www.apollographql.com/docs/react/performance/server-side-rendering/

import { cookies } from 'next/headers'

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

export function getBackendServerUrl(): string {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:4000'
    } else {
        throw new Error('Unknown deployment environment')
    }
}

const httpLink = createHttpLink({
    uri: `${getBackendServerUrl()}/graphql` // Your GraphQL server URL
})

const authMiddleware = (token: string) =>
    setContext(async (_, { headers = {} }) => {
        return {
            headers: {
                ...headers,
                ...{
                    'x-access-token': token
                }
            }
        }
    })

export async function getApolloClient() {
    const cookie = await cookies()
    const token = cookie.get('token')

    const client = new ApolloClient({
        ssrMode: true,
        link: authMiddleware(token?.value || '').concat(httpLink),
        cache: new InMemoryCache()
    })

    return client
}