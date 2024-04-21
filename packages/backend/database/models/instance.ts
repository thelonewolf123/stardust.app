import { preQuery } from '@/backend/library'
import { getModelForClass, pre, prop } from '@typegoose/typegoose'

@pre<Instance>('find', preQuery)
@pre<Instance>('findOne', preQuery)
@pre<Instance>('updateOne', preQuery)
@pre<Instance>('updateMany', preQuery)
class Instance {
    @prop({ type: String, required: true })
    public amiId!: string

    @prop({ type: String, required: false })
    public instanceId!: string

    @prop({
        type: String,
        required: true,
        enum: ['pending', 'running', 'stopped', 'terminated', 'failed']
    })
    public status!: 'pending' | 'running' | 'stopped' | 'terminated' | 'failed'

    @prop({ type: Boolean, required: false, default: false })
    public isTerminatedByHealthCheck!: boolean

    @prop({ type: Date, required: false, default: Date.now() })
    public createdAt!: Date

    @prop({ type: Date, required: false, default: Date.now() })
    public updatedAt!: Date

    @prop({ type: Date, required: false, default: Date.now() })
    public deletedAt!: Date

    @prop({ type: String, required: false })
    public ipAddress!: string

    @prop({ type: String, required: false, default: 'us-east-1' })
    public region!: string

    @prop({ type: Boolean, required: true, default: false })
    public deleted!: boolean
}

export const InstanceModel = getModelForClass(Instance)
