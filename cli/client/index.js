import { request } from 'graphql-request'
import { config } from '../constants.js'

export const BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:4000'

export function getGqlClient() {
    const graphqlUrl = `${BASE_URL}/graphql`
    return {
        query: async (
            /** @type {{ query: any,  variables: any}} */ { query, variables }
        ) => {
            const data = await request(graphqlUrl, query, variables, {
                'x-access-token': config.accessToken
            })
            return { data }
        },
        mutate: async (
            /** @type {{ mutation: any,  variables: any}} */ {
                mutation,
                variables
            }
        ) => {
            const data = await request(graphqlUrl, mutation, variables, {
                'x-access-token': config.accessToken
            })
            return { data }
        }
    }
}
