import { getModelForClass, prop } from '@typegoose/typegoose'

export class User {
    @prop({ type: String, required: true })
    public username!: string

    @prop({ type: String, required: true })
    public email!: string

    // NOTE: needed for jwt token
    @prop({ type: Number, default: 0, required: true })
    public count!: number

    @prop({ type: Date, default: Date.now(), required: false })
    public createdAt!: Date

    @prop({ type: Date, default: Date.now(), required: false })
    public updatedAt!: Date

    @prop({ type: String, required: true })
    github_access_token!: string
}

export const UserModel = getModelForClass(User)
