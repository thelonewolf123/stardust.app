import { getModelForClass, prop, PropType, Ref } from '@typegoose/typegoose'

import { InstanceModel } from './instance'

class ContainerClass {
    @prop({ type: () => String, required: true })
    public containerSlug!: string

    @prop({ type: () => String, required: true })
    public image!: string

    @prop({
        type: () => String,
        required: true,
        enum: ['scheduled', 'running', 'stopped', 'checkpoint', 'deleted']
    })
    public status!:
        | 'scheduled'
        | 'running'
        | 'stopped'
        | 'checkpoint'
        | 'deleted'

    @prop({ type: () => Date, required: true, default: Date.now() })
    public createdAt!: Date

    @prop({ type: () => Date, required: true, default: Date.now() })
    public updatedAt!: Date

    @prop({ type: () => Date, required: false })
    public deletedAt!: Date

    @prop({ type: () => String, required: false }, PropType.MAP)
    public metaData!: Record<string, string>

    @prop({ type: () => String, required: false })
    public containerId!: string

    @prop({ type: () => String, required: false })
    public checkpointId!: string

    @prop({ ref: () => InstanceModel, required: true })
    public instanceId!: Ref<typeof InstanceModel>
}

export const ContainerModel = getModelForClass(ContainerClass)
