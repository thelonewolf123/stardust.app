import {
    BUILD_CONTAINER,
    DESTROY_CONTAINER,
    NEW_CONTAINER
} from '../../constants/queue'
import { connect } from '../../packages/backend/database/mongoose'
import ec2 from '../../packages/core/aws/ec2.aws'
import { ecr } from '../../packages/core/aws/ecr.aws'
import { queueManager } from '../../packages/core/queue'
import redis from '../../packages/core/redis'
import { ContainerModel } from '../../packages/backend/database/models/containers'
import { InstanceModel } from '../../packages/backend/database/models/instance'
import { ProjectModel } from '../../packages/backend/database/models/project'

async function connectMongodb() {
    await connect()
    console.log('Mongoose connected')
}

async function purgeQueue() {
    const queue = [BUILD_CONTAINER, DESTROY_CONTAINER, NEW_CONTAINER]
    queue.map(async (queue) => {
        const { onMessage, channel, cleanup } = await queueManager({
            exchange: queue.EXCHANGE_NAME,
            queue: queue.QUEUE_NAME,
            routingKey: queue.ROUTING_KEY
        })
        process.on('SIGINT', () => cleanup())

        onMessage((message) => {
            if (!message) return
            console.log(
                'QUEUE MESSAGE => ',
                queue.EXCHANGE_NAME,
                message.content.toString()
            )
            channel.receiver.ack(message)
        })
    })
    await new Promise((resolve) => setTimeout(resolve, 10_000))
    console.log('Queue purged')
}

async function purgeRedis() {
    await redis.connect()
    // purge all keys
    await redis.client.flushdb()
    await redis.client.quit()
    console.log('Redis purged')
}

async function purgeEc2() {
    const instances = await InstanceModel.find({}).lean()

    await Promise.all(
        instances.map(async (instance) => {
            return ec2.terminateInstance(instance.instanceId).catch(() => {})
        })
    )

    console.log('EC2 purged')
}

async function purgeEcr() {
    const repos = await ProjectModel.find({}).lean()
    await Promise.all(
        repos.map(async (repo) => {
            const repoName = repo.ecrRepo.split('/').slice(1).join('/') // remove the account id
            await ecr.deleteEcrRepo({ name: repoName }).catch((e) => {
                console.log('ECR repo not found', e.message, repoName)
            })
        })
    )

    console.log('ECR purged')
}

async function purgeMongo() {
    await Promise.all([
        ContainerModel.deleteMany({ createdAt: { $exists: true } }),
        ProjectModel.deleteMany({ createdAt: { $exists: true } }),
        InstanceModel.deleteMany({ createdAt: { $exists: true } })
    ]).then(() => {
        console.log('MongoDB purged')
    })
}

async function main() {
    await connectMongodb()
    await Promise.all([purgeEc2(), purgeEcr(), purgeQueue(), purgeRedis()])
    await purgeMongo()
}

main()
    .then(() => {
        console.log('Purge complete')
        process.exit()
    })
    .catch(console.error)
