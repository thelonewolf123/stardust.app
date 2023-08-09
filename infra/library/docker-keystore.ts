import fs from 'fs'

import * as aws from '@pulumi/aws'

import { storeSecret } from './ssm'

export const dockerCerts = fs.existsSync('./certs')
    ? fs.readdirSync('./certs').map((file) => {
          return storeSecret(
              file,
              fs.readFileSync(`./certs/${file}`).toString()
          )
      })
    : process.exit(1)
