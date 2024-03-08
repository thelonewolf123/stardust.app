// https://www.apollographql.com/docs/react/performance/server-side-rendering/

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

export function getBackendServerUrl(): string {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:4000'
    } else {
        throw new Error('Unknown deployment environment')
    }
}

export async function getAuthHeader(): Promise<{
    'x-token': string
}> {
    if (typeof window === 'undefined') {
        // this block will be reachable only during build
        return {
            'x-token': ''
        }
    }

    const token = sessionStorage.getItem('token') || ''

    return {
        'x-token': token || ''
    }
}

const httpLink = createHttpLink({
    uri: `${getBackendServerUrl()}/graphql` // Your GraphQL server URL
})

const authMiddleware = setContext(async (_, { headers = {} }) => {
    const authHeader = await getAuthHeader()
    return {
        headers: {
            ...headers,
            ...authHeader
        }
    }
})

function getApolloClient() {
    if (typeof window === 'undefined') {
        const client = new ApolloClient({
            ssrMode: true,
            link: authMiddleware.concat(httpLink),
            cache: new InMemoryCache()
        })

        return client
    }

    const client = new ApolloClient({
        link: authMiddleware.concat(httpLink),
        cache: new InMemoryCache()
    })
    return client
}

const client = getApolloClient()

export default client
