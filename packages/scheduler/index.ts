import {
    setupDestroyContainerConsumer,
    setupNewContainerConsumer
} from './container'
import redis from './library/redis'

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
