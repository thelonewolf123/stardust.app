// https://www.apollographql.com/docs/react/performance/server-side-rendering/

import { getAccessToken } from '@/action/auth'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

export function getBackendServerUrl(urlType: 'http' | 'ws' = 'http'): string {
    const scheme = urlType === 'ws' ? 'ws' : 'http'

    if (process.env.NODE_ENV === 'development') {
        return `${scheme}://localhost:4000`
    } else {
        throw new Error('Unknown deployment environment')
    }
}

async function getAuthHeader(): Promise<{
    'x-access-token': string
}> {
    if (typeof window === 'undefined') {
        return {
            'x-access-token': ''
        }
    }

    let token: string | undefined = localStorage.getItem('token') || undefined

    if (!token) {
        token = await getAccessToken()
        console.log('Token from cookie', token)
        if (token) {
            localStorage.setItem('token', token)
        }
    }

    return {
        'x-access-token': token || ''
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
