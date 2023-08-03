import { getModelForClass, prop } from '@typegoose/typegoose'

class InstanceClass {
    @prop({ required: true })
    public name!: string

    @prop({ required: true })
    public amiId!: string

    @prop({
        required: true,
        enum: ['scheduled', 'running', 'stopped', 'terminated']
    })
    public status!: 'scheduled' | 'running' | 'stopped' | 'terminated'

    @prop({ required: false })
    public isTerminatedByHealthCheck!: boolean

    @prop({ required: true })
    public createdAt!: Date

    @prop({ required: true })
    public updatedAt!: Date

    @prop({ required: true })
    public deletedAt!: Date

    @prop({ required: true })
    public ipAddress!: string

    @prop({ required: true })
    public region!: string
}

export const InstanceModel = getModelForClass(InstanceClass)
