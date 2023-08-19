import invariant from 'invariant'

import { Context } from '@/types'

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getRegularUser(ctx: Context) {
    invariant(ctx.user, 'User is not authenticated')
    return ctx.user
}
