import Dockerode from 'dockerode'
import invariant from 'invariant'
import path from 'path'
import { v4 } from 'uuid'
import { z } from 'zod'

import { makeQueryablePromise, sleep } from '@/core/utils'
import InstanceStrategy from '@/scheduler/library/instance'
import { getContainer } from '@/scheduler/lua/container'
import { ContainerBuildSchema } from '@/scheduler/schema'
import { ProviderType } from '@/types'
import { ERROR_CODES } from '@constants/aws-infra'

export class BuildImageStrategy {
    #data: z.infer<typeof ContainerBuildSchema>
    #instance: InstanceStrategy
    #docker: Dockerode | null = null
    #githubRepoPath: string
    #dockerBuildConfig

    constructor(
        data: z.infer<typeof ContainerBuildSchema>,
        provider: ProviderType
    ) {
        this.#data = data
        this.#instance = new InstanceStrategy(provider)
        this.#githubRepoPath = path.join(v4())
        this.#dockerBuildConfig = {
            file: {
                context: path.join(
                    this.#githubRepoPath,
                    this.#data.dockerContext || '.'
                ),
                src: [
                    path.join(
                        this.#githubRepoPath,
                        this.#data.dockerPath || 'Dockerfile'
                    )
                ]
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
                console.log('Image pushed successfully.')
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
        return this.#instance.getInstanceForContainerBuild(
            this.#data.containerSlug,
            this.#data.projectSlug
        )
    }

    buildImage() {
        return this.#getInstanceForContainerBuild()
            .then(this.#instance.waitTillInstanceReady)
            .then(this.#cloneRepo)
            .then(this.#instance.getDockerClient)
            .then((docker) => (this.#docker = docker))
            .then(this.#buildDockerImage)
            .then(this.#pushDockerImage)
    }
}
