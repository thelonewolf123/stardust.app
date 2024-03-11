#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { loginCmdHandler } from './user/index.js'
import { deleteProjectHandler } from './container/delete.js'
import { startContainerHandler } from './container/start.js'
import { stopContainerHandler } from './container/stop.js'
import { listProjectsHandler } from './container/list.js'
import { inspectContainerHandler } from './container/inspect.js'
import { getContainerLogsHandler } from './container/logs.js'

yargs(hideBin(process.argv))
    .command('login', 'Login to fusion-grid', {}, () => loginCmdHandler())
    .command('delete', 'Remove a deployment', {}, () => deleteProjectHandler())
    .command('start', 'Start a container', {}, () => startContainerHandler())
    .command('stop', 'Stop a container', {}, () => stopContainerHandler())
    .command('list', 'List all projects', {}, () => listProjectsHandler())
    .command('logs', 'Get logs of a container', {}, () =>
        getContainerLogsHandler()
    )
    .command('inspect', 'Inspect a container', {}, () =>
        inspectContainerHandler()
    )
    .demandCommand(1)
    .parse()
