import * as mongodb from '@/backend/database/mongoose'

import redis from '../core/redis'
import {
    setupBuildContainerConsumer,
    setupDestroyContainerConsumer,
    setupNewContainerConsumer
} from './container'

const consumers = async () => {
    try {
        await Promise.all([mongodb.connect(), redis.connect()])

        return Promise.all([
            setupNewContainerConsumer(),
            setupBuildContainerConsumer(),
            setupDestroyContainerConsumer()
        ])
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

consumers()
