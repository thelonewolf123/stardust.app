import redis from '../core/redis'
import {
    setupBuildContainerConsumer,
    setupDestroyContainerConsumer,
    setupNewContainerConsumer
} from './container'

const consumers = async () => {
    try {
        await redis.connect()
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
