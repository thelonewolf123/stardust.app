import { InstanceModel } from '../../backend/database/models/instance'

export async function getAllInstances() {
    return await InstanceModel.find({ status: 'running' }).lean()
}

// redis data model
// ec2-instance
// physicalHost: [{
//   instanceId: {
//     status: 'running',
//     amiId: 'ami-xxxx',
//     scheduledForDeletionAt: '2021-01-01' | null,
//     publicIp: 'xx.xx.xx.xx',
//     containers: [{...metadata}]
//   }
// },]
