import { ContainerStatus } from '@/types/graphql-server'
import { getModelForClass, prop, PropType, Ref } from '@typegoose/typegoose'

import { InstanceModel } from './instance'
import { UserModel } from './user'

class MetaData {
    @prop({ type: String, required: true })
    public name!: string

    @prop({ type: String, required: true })
    public value!: string
}

class Env {
    @prop({ type: String, required: true })
    public name!: string

    @prop({ type: String, required: true })
    public value!: string
}

class BuildArgs {
    @prop({ type: String, required: true })
    public name!: string

    @prop({ type: String, required: true })
    public value!: string
}

export class Container {
    @prop({ type: String, required: true })
    public containerSlug!: string

    @prop({ type: Number, required: false, default: 0 })
    public containerBuildAttempts?: number

    @prop({ type: Number, required: false, default: 0 })
    public containerDeployAttempts?: number

    @prop({ type: Number, required: false, default: 0 })
    public containerTerminateAttempts?: number

    @prop({ type: String, required: true })
    public image!: string

    @prop({
        type: String,
        required: true,
        enum: ['pending', 'running', 'checkpoint', 'terminated', 'failed']
    })
    public status!: ContainerStatus

    @prop({ type: Date, required: true, default: Date.now() })
    public createdAt!: Date

    @prop({ type: Date, required: true, default: Date.now() })
    public updatedAt!: Date

    @prop({ type: Date, required: false })
    public terminatedAt!: Date

    @prop({ type: MetaData, required: false }, PropType.ARRAY)
    public metaData!: MetaData[]

    @prop({ type: Env, required: false }, PropType.ARRAY)
    public env!: Env[]

    @prop({ type: BuildArgs, required: false }, PropType.ARRAY)
    public buildArgs!: BuildArgs[]

    @prop({ type: String, required: false }, PropType.ARRAY)
    public command!: string[]

    @prop({ type: String, required: false })
    public containerId!: string

    @prop({ type: String, required: false })
    public checkpointId!: string

    @prop({ ref: InstanceModel, required: false })
    public instanceId!: Ref<typeof InstanceModel>

    @prop({ type: Number, required: false })
    public port!: number

    @prop({ type: Number, required: true })
    public version!: number

    @prop({ ref: () => UserModel, required: true })
    public createdBy!: Ref<typeof UserModel>

    @prop({ type: String, required: false }, PropType.ARRAY)
    public containerBuildLogs!: string[]
}

export const ContainerModel = getModelForClass(Container)
