// https://www.apollographql.com/docs/react/performance/server-side-rendering/

import { cookies } from 'next/headers'

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { getBackendServerUrl } from './graphql'

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

export async function getAccessToken() {
    const cookie = await cookies()
    const token = cookie.get('token')
    return token?.value
}

export async function getApolloClient() {
    const token = await getAccessToken()

    const client = new ApolloClient({
        ssrMode: true,
        link: authMiddleware(token || '').concat(httpLink),
        cache: new InMemoryCache()
    })

    return client
}
