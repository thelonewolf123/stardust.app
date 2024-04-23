import invariant from 'invariant'
import { generate } from 'random-words'

import { Context, PublisherType, QueryablePromise } from '@/types'

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

export const getPublisherName = (type: PublisherType, id: string) => {
    const publishers = {
        BUILD_LOGS: `logger:build:${id}`,
        CONTAINER_LOGS: `logger:container-logs:${id}`
    }

    return publishers[type]
}

export const getPublisherType = (ch: string): PublisherType => {
    if (ch.includes('build')) {
        return 'BUILD_LOGS'
    }
    if (ch.includes('container-logs')) {
        return 'CONTAINER_LOGS'
    }
    throw new Error('Unknown publisher type')
}

export function convertToObject(arr: Array<{ name: string; value: string }>) {
    const obj: Record<string, string> = {}
    arr.forEach((item) => {
        obj[item.name] = item.value
    })
    return obj
}
