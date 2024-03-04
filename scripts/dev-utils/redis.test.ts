import { getPublisher } from '../../packages/core/redis'

const publisher = getPublisher('BUILD_LOGS', 'test')
for (let i = 0; i < 100; i++) {
    publisher.publish(`Message ${i}`)
}
