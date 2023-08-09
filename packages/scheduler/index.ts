import redis from '../core/redis'
import {
    setupDestroyContainerConsumer,
    setupNewContainerConsumer
} from './container'

const consumers = async () => {
    try {
        await redis.connect()
        return Promise.all([
            setupNewContainerConsumer(),
            setupDestroyContainerConsumer()
        ])
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

consumers()
