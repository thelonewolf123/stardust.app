import { getModelForClass, prop } from '@typegoose/typegoose'

class UserClass {
    @prop({ type: () => String, required: true })
    public username!: string

    @prop({ type: () => String, required: true })
    public email!: string

    @prop({ type: () => String, required: true })
    public password!: string

    // NOTE: needed for jwt token
    @prop({ type: () => Number, required: true })
    public count!: number

    @prop({ type: () => Date, default: Date.now(), required: true })
    public createdAt!: Date
}

export const User = getModelForClass(UserClass)
