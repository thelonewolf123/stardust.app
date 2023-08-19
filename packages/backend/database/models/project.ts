import { getModelForClass, prop, PropType, Ref } from '@typegoose/typegoose'

import { Container } from './containers'

export class Project {
    @prop({ type: String, required: true })
    public userId!: string

    @prop({ type: String, required: true })
    public name!: string

    @prop({ type: String, required: true })
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

    @prop({ type: Container, required: false }, PropType.ARRAY)
    public history!: Ref<typeof Container>[]

    @prop({ type: Container, required: false })
    public current!: Ref<typeof Container>

    @prop({ type: Date, default: Date.now(), required: true })
    public createdAt!: Date

    @prop({ type: Date, default: Date.now(), required: true })
    public updatedAt!: Date
}

export const ProjectModel = getModelForClass(Project)
