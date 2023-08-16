import * as aws from '@pulumi/aws'

const region = aws.getRegion()
export const regionName = region.then((r) => r.name)
