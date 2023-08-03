import { InstanceModel } from '../../backend/database/models/instance'

export async function getAllInstances() {
    return await InstanceModel.find({ status: 'running' }).lean()
}
