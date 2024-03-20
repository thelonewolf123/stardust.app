import Dockerode from 'dockerode'
import invariant from 'invariant'

import { InstanceExecArgs, ProviderType } from '@/types'
import { Instance } from '@aws-sdk/client-ec2'
import { SPOT_INSTANCE_PRICE_PER_HOUR } from '@constants/provider'

import InstanceStrategyAws from './instance.aws'
import InstanceStrategyAwsSpot from './instance.aws.spot'

class InstanceStrategy {
    provider: ProviderType
    strategy: InstanceStrategyAws | InstanceStrategyAwsSpot

    constructor(provider: ProviderType) {
        this.provider = provider
        this.strategy = this.#createStrategy()
    }

    #createStrategy() {
        if (this.provider === 'aws') {
            return new InstanceStrategyAws()
        } else if (this.provider === 'aws-spot') {
            return new InstanceStrategyAwsSpot(SPOT_INSTANCE_PRICE_PER_HOUR)
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

    exec(
        params: Omit<InstanceExecArgs, 'ipAddress'>
    ): Promise<readonly [() => void, Promise<string>]> {
        return this.strategy.exec(params)
    }

    getAuthConfig(): Promise<{
        username: string
        password: string
    }> {
        return this.strategy.getAuthConfig()
    }

    freeContainerInstance(containerId: string): Promise<void> {
        return this.strategy.freeContainerInstance(containerId)
    }

    async getInstanceIp(): Promise<string> {
        const ipAddr = await this.strategy.getInstanceIp()
        invariant(ipAddr, 'Instance IP not found')
        return ipAddr
    }
}

export default InstanceStrategy
