import gql from 'graphql-tag'
import { getGqlClient } from '../client/index.js'
import { getLoginInput } from '../prompt/index.js'
import colors from 'colors'
import { existsSync, writeFileSync } from 'fs'
import { config_path } from '../constants.js'
import { execSync } from 'child_process'

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
    return token
}

const loginSuccess = (
    /** @type {String} */ token,
    /** @type {String} */ username,
    /** @type {String} */ password
) => {
    console.log('Logged in successfully'.green.bold)
    console.log('Saving credentials...'.yellow)
    const config = {
        accessToken: token,
        username,
        password
    }
    if (!existsSync(config_path)) execSync('mkdir -p ~/.fusion')
    writeFileSync(config_path, JSON.stringify(config, null, 4))
    console.log('Credentials saved'.green.bold)
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
