import { ContainerModel } from '@models/containers'
import { InstanceModel } from '@models/instance'
import { ProjectModel } from '@models/project'
import { UserModel } from '@models/user'

export default {
    Container: ContainerModel,
    Instance: InstanceModel,
    Project: ProjectModel,
    User: UserModel
} as const
