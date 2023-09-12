import { request } from 'graphql-request'

export function getApolloClient() {
    const baseUrl =
        process.env.BACKEND_BASE_URL || 'http://localhost:4000/graphql'
    return {
        query: async (
            /** @type {{ query: any,  variables: any}} */ { query, variables }
        ) => {
            const data = await request(baseUrl, query, variables)
            return { data }
        },
        mutate: async (
            /** @type {{ mutation: any,  variables: any}} */ {
                mutation,
                variables
            }
        ) => {
            const data = await request(baseUrl, mutation, variables)
            return { data }
        }
    }
}
