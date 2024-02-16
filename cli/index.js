#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { loginCmdHandler } from './user/index.js'
import { deployContainerHandler } from './container/index.js'
import { deleteProjectHandler } from './container/delete.js'
import { startContainerHandler } from './container/start.js'
import { stopContainerHandler } from './container/stop.js'

yargs(hideBin(process.argv))
    .command('login', 'Login to fusion-grid', {}, () => loginCmdHandler())
    .command('create', 'Schedule a container deployment', {}, () =>
        deployContainerHandler()
    )
    .command('delete', 'Remove a deployment', {}, () => deleteProjectHandler())
    .command('start', 'Start a container', {}, () => startContainerHandler())
    .command('stop', 'Stop a container', {}, () => stopContainerHandler())
    .command('list', 'List all containers', {}, () => {
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
