#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { loginCmdHandler } from './user/index.js'

// "name": "learning-golangx",
// "description": "learning-golang - deployment",
// "dockerContext": ".",
// "dockerPath": "./Dockerfile",
// "githubBranch": "main",
// "port": 8000,
// "githubUrl": "https://github.com/thelonewolf123/learning-golang"

yargs(hideBin(process.argv))
    .command('login', 'Login to the platform', {}, () => loginCmdHandler())
    .demandCommand(1)
    .parse()
