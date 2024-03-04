import { getPublisher } from '../../packages/core/redis'

const publisher = getPublisher('logger:info')
for (let i = 0; i < 100; i++) {
    publisher(`Message ${i}`)
}
