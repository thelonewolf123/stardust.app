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
    #dockerBuildConfig
    dockerContext: string

    constructor(
        data: z.infer<typeof ContainerBuildSchema>,
        queue: Context['queue']['createContainer'],
        provider: ProviderType
    ) {
        this.#data = data
        this.#queue = queue
        this.#instance = new InstanceStrategy(provider)
        this.#githubRepoPath = path.join('/home/ubuntu/', v4())
        this.dockerContext = path.join(
            this.#githubRepoPath,
            this.#data.dockerContext || '.'
        )

        this.#dockerBuildConfig = {
            file: {
                context: this.dockerContext,
                src: []
                // src: [this.#data.dockerPath || 'Dockerfile']
            },
            args: {
                buildargs: this.#data.buildArgs || {},
                t: this.#data.ecrRepo
            }
        }
    }

    async #buildDockerImage() {
        invariant(this.#docker, 'Docker client not found')
        const buildStream: any = await this.#docker.buildImage(
            this.#dockerBuildConfig.file,
            this.#dockerBuildConfig.args
        )

        const containerBuildPromise = makeQueryablePromise(
            new Promise<void>((resolve, reject) => {
                invariant(this.#docker, 'Docker client not found')
                this.#docker.modem.followProgress(buildStream, (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        )

        while (true) {
            // periodically check if promise is completed!
            if (containerBuildPromise.isFulfilled) {
                // The promise is completed
                console.log('Image build completed!')
                break
            }

            const containerData = await getContainer({
                containerSlug: this.#data.containerSlug,
                projectSlug: this.#data.projectSlug
            })

            if (!containerData) {
                throw new Error(ERROR_CODES.CONTAINER_BUILD_FAILED)
            }

            if (containerData.containerSlug !== this.#data.containerSlug) {
                buildStream.destroy() // destroy build stream
                throw new Error(ERROR_CODES.CONTAINER_BUILD_HAS_CANCELED)
            }

            await sleep(1000)
        }

        console.log('Image built successfully.')
    }

    async #cloneRepo() {
        await this.#instance.exec(
            `git clone -b ${this.#data.githubRepoBranch} ${
                this.#data.githubRepoUrl
            } ${this.#githubRepoPath}`
        )
        await sleep(45_000)
    }

    async #removeRepo() {
        await this.#instance.exec(`rm -rf ${this.#githubRepoPath}`)
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
