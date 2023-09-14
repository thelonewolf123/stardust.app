#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { loginCmdHandler } from './user/index.js'
import { deployContainerHandler } from './container/index.js'

yargs(hideBin(process.argv))
    .command('login', 'Login to fusion-grid', {}, () => loginCmdHandler())
    .command('deploy', 'Schedule a container deployment', {}, () =>
        deployContainerHandler()
    )
    .command('rm', 'Remove a container', {}, () => {
        throw new Error('Not implemented')
    })
    .command('ls', 'List all containers', {}, () => {
        throw new Error('Not implemented')
    })
    .command('logs', 'Get logs of a container', {}, () => {
        throw new Error('Not implemented')
    })
    .command('inspect', 'Inspect a container', {}, () => {
        throw new Error('Not implemented')
    })
    .demandCommand(1)
    .parse()
