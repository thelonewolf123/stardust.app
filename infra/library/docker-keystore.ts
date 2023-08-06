import fs from 'fs'

import * as aws from '@pulumi/aws'

import { remoteDockerBucket } from '../library/s3'

export const dockerCerts = fs.existsSync('./certs')
    ? fs.readdirSync('./certs').map((file) => {
          return new aws.s3.BucketObject(file, {
              key: file,
              acl: 'private',
              bucket: remoteDockerBucket.id.apply((id) => id),
              content: fs.readFileSync(`./certs/${file}`).toString()
          })
      })
    : process.exit(1)
