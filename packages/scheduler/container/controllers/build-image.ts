import Dockerode from 'dockerode'
import invariant from 'invariant'
import path from 'path'
import { v4 } from 'uuid'
import { z } from 'zod'

import models from '@/backend/database'
import { makeQueryablePromise, sleep } from '@/core/utils'
import InstanceStrategy from '@/scheduler/library/instance'
import { deleteContainer, getContainer } from '@/scheduler/lua/container'
import { ContainerBuildSchema } from '@/schema'
import { Context, ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'
import { getPublisher } from '@core/redis'

export class BuildImageStrategy {
    #data: z.infer<typeof ContainerBuildSchema>
    #queue: Context['queue']['createContainer']
    #instance: InstanceStrategy
    #docker: Dockerode | null = null
    #githubRepoPath: string
    #publisher: ReturnType<typeof getPublisher>

    constructor(
        data: z.infer<typeof ContainerBuildSchema>,
        queue: Context['queue']['createContainer'],
        provider: ProviderType
    ) {
        this.#data = data
        this.#queue = queue
        this.#instance = new InstanceStrategy(provider)
        this.#githubRepoPath = path.join('/home/ubuntu/', v4())
        this.#publisher = getPublisher('BUILD_LOGS', this.#data.containerSlug)
    }

    async #buildDockerImage() {
        invariant(this.#instance, 'Instance not found')
        invariant(this.#docker, 'Docker client not found')
        this.#publisher.publish('Building docker image...')

        const buildArgs = Object.entries(this.#data.buildArgs ?? {})
            .map(([key, value]) => {
                return ['--build-arg', `${key}=${value}`]
            })
            .flat()

        const dockerPathArgs = []

        if (this.#data.dockerPath) {
            dockerPathArgs.push('-f', this.#data.dockerPath)
        }

        const [cancelBuild, buildProgress] = await this.#instance.exec({
            command: 'docker',
            args: [
                'build',
                '-t',
                this.#data.ecrRepo,
                ...dockerPathArgs,
                ...buildArgs,
                this.#data.dockerContext
            ],
            cwd: this.#githubRepoPath,
            sudo: true,
            onProgress: (progress) => {
                console.log('Build progress: ', progress)
                this.#publisher.publish(progress)
            }
        })

        const promiseQuery = makeQueryablePromise(buildProgress)

        while (true) {
            const containerInfo = await getContainer({
                projectSlug: this.#data.projectSlug
            })

            console.log(
                'Container info: ',
                containerInfo,
                new Date().toISOString()
            )

            if (containerInfo?.containerSlug !== this.#data.containerSlug) {
                cancelBuild()
                throw new Error('Container build failed')
            }

            if (promiseQuery.isFulfilled) break

            await sleep(1000)
        }

        if (promiseQuery.isRejected) throw new Error('Container build failed')

        const logs = await buildProgress
        await models.Container.updateOne(
            { containerSlug: this.#data.containerSlug },
            {
                $set: {
                    containerBuildLogs: logs.split('\n'),
                    updatedAt: new Date()
                }
            }
        )

        console.log('Image built successfully.')
        this.#publisher.publish('Image built successfully.')
    }

    async #cloneRepo() {
        this.#publisher.publish('Cloning repository...')
        const [_, progress] = await this.#instance.exec({
            command: 'git',
            args: [
                'clone',
                '-b',
                this.#data.githubRepoBranch,
                this.#data.githubRepoUrl,
                this.#githubRepoPath
            ],
            sudo: true
        })
        await progress
        this.#publisher.publish('Repository cloned successfully.')
    }

    async #removeRepo() {
        await this.#instance.exec({
            command: 'rm',
            args: ['-rf', this.#githubRepoPath]
        })
    }

    async #pushDockerImage() {
        invariant(this.#docker, 'Docker client not found')
        this.#publisher.publish('Pushing image to ECR...')
        const [, pushProgress] = await this.#instance.exec({
            command: 'docker',
            args: ['push', this.#data.ecrRepo],
            sudo: true
        })
        await pushProgress
        this.#publisher.publish('Image pushed to ECR successfully.')
    }

    async #removeDockerImage() {
        invariant(this.#docker, 'Docker client not found')
        this.#publisher.publish('Removing docker image...')
        await this.#docker.getImage(this.#data.ecrRepo).remove()
        console.log('Image removed successfully.')
    }

    async #freeContainer() {
        invariant(this.#instance, 'Instance not found')
        return this.#instance.freeContainerInstance(this.#data.containerSlug)
    }

    async #getInstanceForContainerBuild() {
        this.#publisher.publish('Provisioning instance for container build...')
        await this.#instance.getInstanceForContainerBuild({
            containerSlug: this.#data.containerSlug,
            projectSlug: this.#data.projectSlug
        })
        this.#publisher.publish('Instance provisioned successfully.')
    }

    async #scheduleNewContainer() {
        this.#publisher.publish('Scheduling new container...')
        const container = await models.Container.findOne({
            containerSlug: this.#data.containerSlug
        }).lean()
        const env: Record<string, string> = {}
        const metaData: Record<string, string> = {}

        container?.env?.map(({ name, value }) => {
            env[name] = value
        })
        container?.metaData?.map(({ name, value }) => {
            metaData[name] = value
        })

        await this.#queue.publish({
            containerSlug: this.#data.containerSlug,
            ports: container?.port ? [container?.port] : [],
            command: container?.command || [],
            env: env,
            image: this.#data.ecrRepo
        })
        this.#publisher.publish('New container scheduled successfully.')
    }

    async #handleError(error: Error) {
        console.error('Container provision error: ', error)
        await deleteContainer(this.#data.containerSlug)

        if (error.message === ERROR_CODES.INSTANCE_PROVISION_FAILED) {
            console.log('Instance provision failed, retrying...')
        }

        throw error
    }

    buildImage() {
        return this.#getInstanceForContainerBuild()
            .then(() => this.#instance.waitTillInstanceReady())
            .then(() => this.#cloneRepo())
            .then(() => this.#instance.getDockerClient())
            .then((docker) => (this.#docker = docker))
            .then(() => this.#buildDockerImage())
            .then(() => this.#pushDockerImage())
            .then(() => this.#removeRepo())
            .then(() => this.#removeDockerImage())
            .then(() => this.#freeContainer())
            .then(() => this.#scheduleNewContainer())
            .catch((err) => this.#handleError(err))
    }
}
