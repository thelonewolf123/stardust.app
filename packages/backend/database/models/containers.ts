import { getModelForClass, prop, Ref } from '@typegoose/typegoose'

import { InstanceModel } from './instance'

class ContainerClass {
    @prop({ required: true })
    public name!: string

    @prop({ required: true })
    public image!: string

    @prop({
        required: true,
        enum: ['scheduled', 'running', 'stopped', 'checkpoint', 'deleted']
    })
    public status!:
        | 'scheduled'
        | 'running'
        | 'stopped'
        | 'checkpoint'
        | 'deleted'

    @prop({ required: true, default: Date.now() })
    public createdAt!: Date

    @prop({ required: true, default: Date.now() })
    public updatedAt!: Date

    @prop({ required: false })
    public deletedAt!: Date

    @prop({ required: false })
    public metaData!: Record<string, unknown>

    @prop({ required: false })
    public containerId!: string

    @prop({ required: false })
    public checkpointId!: string

    @prop({ ref: InstanceModel, required: true })
    public instanceId!: Ref<typeof InstanceModel>
}

export const ContainerModel = getModelForClass(ContainerClass)
