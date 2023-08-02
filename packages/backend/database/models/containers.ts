import { getModelForClass, prop, Ref } from '@typegoose/typegoose'

import { InstanceModel } from './instance'

class ContainerClass {
    @prop({ required: true })
    public name!: string

    @prop({ required: true })
    public image!: string

    @prop({ required: true })
    public status!: string

    @prop({ required: true })
    public createdAt!: Date

    @prop({ required: true })
    public updatedAt!: Date

    @prop({ required: true })
    public deletedAt!: Date

    @prop({ required: true })
    public userId!: string

    @prop({ required: true })
    public containerId!: string

    @prop({ required: true })
    public checkpointId!: string

    @prop({ ref: InstanceModel, required: true })
    public instanceId!: Ref<typeof InstanceModel>
}

export const ContainerModel = getModelForClass(ContainerClass)
