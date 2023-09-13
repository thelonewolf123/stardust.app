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
    .demandCommand(1)
    .parse()
