import { Context } from '@/types'

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getRegularUser(ctx: Context) {
    if (!ctx.user) throw new Error('User not found')
    return ctx.user
}
