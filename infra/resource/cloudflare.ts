import * as cloudflare from '@pulumi/cloudflare'
import { Output } from '@pulumi/pulumi'

import { env } from '../../packages/env'

// Replace these with your actual values
const cloudflareZoneId = env.CLOUDFLARE_ZONE_ID
const domainName = env.DOMAIN_NAME

// Create a DNS A record to point the subdomain to the EC2 instance's public IP
export const addDnsRecord = (publicIp: Output<string>) =>
    new cloudflare.Record('proxy-record', {
        zoneId: cloudflareZoneId,
        name: domainName,
        type: 'A',
        value: publicIp,
        ttl: 300 // Time to live for DNS record in seconds
    })
