import { readFileSync } from 'fs'

export const dockerServiceConf = readFileSync(
    './data/docker.service'
).toString()
