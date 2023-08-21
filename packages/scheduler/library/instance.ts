import Dockerode from 'dockerode'

import { getDockerClient } from '@/core/docker'
import { ProviderType } from '@/types'
import { Instance } from '@aws-sdk/client-ec2'

import InstanceStrategyAws from './instance.aws'

class InstanceStrategy {
    provider: ProviderType
    strategy: InstanceStrategyAws

    constructor(provider: ProviderType) {
        this.provider = provider
        this.strategy = this.#createStrategy()
    }

    #createStrategy() {
        if (this.provider === 'aws') {
            return new InstanceStrategyAws()
        }
        throw new Error('Provider not supported')
    }

    getInstanceForContainerBuild(
        containerSlug: string,
        projectSlug: string
    ): Promise<string> {
        return this.strategy.getInstanceForContainerBuild(
            projectSlug,
            containerSlug
        )
    }

    getInstanceForNewContainer(containerSlug: string): Promise<string> {
        return this.strategy.getInstanceForNewContainer(containerSlug)
    }

    waitTillInstanceReady(id?: string): Promise<Instance> {
        return this.strategy.waitTillInstanceReady(id)
    }

    terminateInstance(id?: string): Promise<void> {
        return this.strategy.terminateInstance(id)
    }

    exec(command: string): Promise<string> {
        return this.strategy.exec(command)
    }

    getDockerClient(): Promise<Dockerode> {
        return this.strategy.getDockerClient()
    }
}

export default InstanceStrategy
