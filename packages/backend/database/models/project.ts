import {
    getModelForClass,
    pre,
    prop,
    PropType,
    Ref
} from '@typegoose/typegoose'

import { preQuery } from '../utils'
import { Container } from './containers'
import { UserModel } from './user'

@pre<Project>('find', preQuery)
@pre<Project>('findOne', preQuery)
@pre<Project>('updateOne', preQuery)
@pre<Project>('updateMany', preQuery)
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

    @prop({ type: Boolean, required: true, default: false })
    public deleted!: boolean
}

export const ProjectModel = getModelForClass(Project)
