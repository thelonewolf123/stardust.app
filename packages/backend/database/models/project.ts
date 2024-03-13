import { getModelForClass, prop, PropType, Ref } from '@typegoose/typegoose'

import { Container } from './containers'
import { UserModel } from './user'

export class Project {
    @prop({ ref: () => UserModel, required: true })
    public user!: Ref<typeof UserModel>

    @prop({ type: String, required: true })
    public name!: string

    @prop({ type: String, required: true, unique: true })
    public slug!: string

    @prop({ type: String, required: true })
    public description!: string

    @prop({ type: String, required: true })
    public githubUrl!: string

    @prop({ type: String, required: true })
    public githubBranch!: string

    @prop({ type: String, required: true })
    public dockerPath!: string

    @prop({ type: String, required: true })
    public dockerContext!: string

    @prop({ type: String, required: true })
    public ecrRepo!: string

    @prop({ ref: () => Container, required: false }, PropType.ARRAY)
    public history!: Ref<typeof Container>[]

    @prop({ type: String, required: true }, PropType.ARRAY)
    public domains!: string[]

    @prop({ ref: () => Container, required: false })
    public current!: Ref<typeof Container>

    @prop({ type: Date, default: Date.now(), required: false })
    public createdAt!: Date

    @prop({ type: Date, default: Date.now(), required: false })
    public updatedAt!: Date
}

export const ProjectModel = getModelForClass(Project)
