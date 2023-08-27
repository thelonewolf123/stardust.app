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

export class BuildImageStrategy {
    #data: z.infer<typeof ContainerBuildSchema>
    #queue: Context['queue']['createContainer']
    #instance: InstanceStrategy
    #docker: Dockerode | null = null
    #githubRepoPath: string

    constructor(
        data: z.infer<typeof ContainerBuildSchema>,
        queue: Context['queue']['createContainer'],
        provider: ProviderType
    ) {
        this.#data = data
        this.#queue = queue
        this.#instance = new InstanceStrategy(provider)
        this.#githubRepoPath = path.join('/home/ubuntu/', v4())
    }

    async #buildDockerImage() {
        invariant(this.#instance, 'Instance not found')
        invariant(this.#docker, 'Docker client not found')
        // TODO: this code is vulnerable to shell injection, fix it @thelonewolf123

        const [cancelBuild, buildProgress] = await this.#instance.exec({
            command: 'docker',
            args: [
                'build',
                '-t',
                this.#data.ecrRepo,
                ...Object.entries(this.#data.buildArgs ?? {}).map(
                    ([key, value]) => {
                        return `--build-arg ${key}=${value}`
                    }
                ),
                '.'
            ],
            cwd: this.#githubRepoPath
        })

        const promiseQuery = makeQueryablePromise(buildProgress)

        while (true) {
            const containerInfo = await getContainer({
                projectSlug: this.#data.containerSlug
            })

            if (containerInfo?.containerSlug !== this.#data.containerSlug) {
                cancelBuild()
                throw new Error('Container build failed')
            }

            if (promiseQuery.isFulfilled) break

            await sleep(1000)
        }

        if (promiseQuery.isRejected) throw new Error('Container build failed')

        console.log('Image built successfully.')
    }

    async #cloneRepo() {
        await this.#instance.exec({
            command: 'git',
            args: [
                'clone',
                '-b',
                this.#data.githubRepoBranch,
                this.#data.githubRepoUrl,
                this.#githubRepoPath
            ]
        })
        await sleep(45_000)
    }

    async #removeRepo() {
        await this.#instance.exec({
            command: 'rm',
            args: ['-rf', this.#githubRepoPath]
        })
    }

    async #pushDockerImage() {
        invariant(this.#docker, 'Docker client not found')
        const image = await this.#docker.getImage(this.#data.ecrRepo)
        const stream = await image.push()

        await new Promise((resolve, reject) => {
            invariant(this.#docker, 'Docker client not found')
            this.#docker.modem.followProgress(stream, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })
    }

    #getInstanceForContainerBuild() {
        return this.#instance.getInstanceForContainerBuild({
            containerSlug: this.#data.containerSlug,
            projectSlug: this.#data.projectSlug
        })
    }

    async #scheduleNewContainer() {
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

        return this.#queue.publish({
            containerSlug: this.#data.containerSlug,
            ports: container?.port ? [container?.port] : [],
            command: container?.command || [],
            env: env,
            image: this.#data.ecrRepo
        })
    }

    async #handleError(error: Error) {
        console.error('Container provision error: ', error)
        await deleteContainer(this.#data.containerSlug)

        await models.Container.updateOne(
            { containerSlug: this.#data.containerSlug },
            {
                $inc: { containerBuildAttempts: 1 }
            }
        )

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
            .then(() => this.#scheduleNewContainer())
            .catch((err) => this.#handleError(err))
    }
}
