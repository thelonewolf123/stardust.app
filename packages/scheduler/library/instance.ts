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

    getInstanceForContainerBuild(args: {
        containerSlug: string
        projectSlug: string
    }): Promise<string> {
        return this.strategy.getInstanceForContainerBuild(args)
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

    getContainerInstance(containerId: string): Promise<Instance> {
        return this.strategy.getContainerInstance(containerId)
    }

    getDockerClient(): Promise<Dockerode> {
        return this.strategy.getDockerClient()
    }

    exec(command: string): Promise<string> {
        return this.strategy.exec(command)
    }
}

export default InstanceStrategy
