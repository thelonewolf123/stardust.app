import fs from 'fs'

import * as aws from '@pulumi/aws'

import { storeSecret } from './ssm'

export const dockerCerts = fs.existsSync('./certs')
    ? fs.readdirSync('./certs').map((file) => {
          return storeSecret({
              secret: fs.readFileSync(`./certs/${file}`).toString(),
              key: file
          })
      })
    : process.exit(1)
