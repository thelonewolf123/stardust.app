import gql from 'graphql-tag'
import { getGqlClient } from '../client/index.js'
import { getLoginInput } from '../prompt/index.js'
import colors from 'colors'

async function login(
    /** @type {{username: String, password: String}} */ { username, password }
) {
    const client = getGqlClient()

    const { data } = await client.query({
        query: gql`
            query LoginQuery($username: String!, $password: String!) {
                login(username: $username, password: $password)
            }
        `,
        variables: {
            username,
            password
        }
    })

    const token = data.login
    process.env.ACCESS_TOKEN = token
}

export const loginCmdHandler = async () => {
    const input = await getLoginInput()
    console.log('Logging in...')

    login(input)
        .then(() => console.log('Logged in successfully'.green.bold))
        .catch((err) => {
            if (err.response)
                console.error(
                    'Login failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else console.error('Login failed'.red.bold, `${err.message}`.yellow)
        })
}
