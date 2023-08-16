import { getModelForClass, prop } from '@typegoose/typegoose'

class InstanceClass {
    @prop({ type: String, required: true })
    public amiId!: string

    @prop({ type: String, required: false })
    public instanceId!: string

    @prop({
        type: String,
        required: true,
        enum: ['pending', 'running', 'stopped', 'terminated']
    })
    public status!: 'pending' | 'running' | 'stopped' | 'terminated'

    @prop({ type: Boolean, required: false, default: false })
    public isTerminatedByHealthCheck!: boolean

    @prop({ type: Date, required: true })
    public createdAt!: Date

    @prop({ type: Date, required: true })
    public updatedAt!: Date

    @prop({ type: Date, required: true })
    public deletedAt!: Date

    @prop({ type: String, required: true })
    public ipAddress!: string

    @prop({ type: String, required: true })
    public region!: string
}

export const InstanceModel = getModelForClass(InstanceClass)
