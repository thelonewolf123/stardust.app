import invariant from 'invariant'

import { Context, QueryablePromise } from '@/types'

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getRegularUser(ctx: Context) {
    invariant(ctx.user, 'User is not authenticated')
    return ctx.user
}

export function makeQueryablePromise<T>(
    promise: Promise<T>
): QueryablePromise<T> {
    const queryablePromise = promise as QueryablePromise<T>

    queryablePromise.isFulfilled = false
    queryablePromise.isRejected = false
    queryablePromise.isResolved = false

    promise.then(
        () => {
            queryablePromise.isFulfilled = true
            queryablePromise.isResolved = true
        },
        (err) => {
            queryablePromise.isFulfilled = true
            queryablePromise.isRejected = true

            throw err
        }
    )

    return queryablePromise
}
