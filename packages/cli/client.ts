import { gql, request } from 'graphql-request'

import { env } from '@/env'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export function getApolloClient() {
    const client = new ApolloClient({
        link: new HttpLink({ uri: env.BACKEND_BASE_URL, fetch }),
        cache: new InMemoryCache(),
        headers: {
            'x-access-token': process.env.ACCESS_TOKEN || ''
        }
    })
    return client
}
