#!/usr/bin/env node
// @ts-check

import gql from 'graphql-tag'
import colors from 'colors'

import { getApolloClient } from './client.js'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { getLoginInput } from './prompt/index.js'

async function login(
    /** @type {{username: String, password: String}} */ { username, password }
) {
    const client = getApolloClient()

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

// "name": "learning-golangx",
// "description": "learning-golang - deployment",
// "dockerContext": ".",
// "dockerPath": "./Dockerfile",
// "githubBranch": "main",
// "port": 8000,
// "githubUrl": "https://github.com/thelonewolf123/learning-golang"

yargs(hideBin(process.argv))
    .command('login', 'Login to the platform', {}, async () => {
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
                else
                    console.error(
                        'Login failed'.red.bold,
                        `${err.message}`.yellow
                    )
            })
    })
    .demandCommand(1)
    .parse()
