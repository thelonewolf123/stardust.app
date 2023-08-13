import lockScript from 'inline:./lock.lua'

import redis from '@/core/redis'

type LockResult = 'added' | 'exists' | 'released' | 'not_found' | 'failed'

export async function addLock(key: string) {
    const result = await redis.runLuaScript(lockScript, [key, 'add'])
    return result as LockResult
}

export async function releaseLock(key: string) {
    const result = await redis.runLuaScript(lockScript, [key, 'release'])
    return result as LockResult
}
