import { getPublisher } from '../../packages/core/redis'

const publisher = getPublisher(
    'CONTAINER_LOGS',
    'thelonewolf123/golang-new-project:0'
)

async function main() {
    for (let i = 0; i < 1000000000; i++) {
        const message = JSON.stringify({
            timestamp: Date.now(),
            message: `Message ${i} lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet`
        })
        publisher.publish(message)
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
}

main()
