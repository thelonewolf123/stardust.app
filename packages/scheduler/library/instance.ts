import { Instance } from '@aws-sdk/client-ec2'

import InstanceStrategyAws from './instance.aws'

class InstanceStrategy {
    provider: 'aws' | 'gcp'
    strategy: InstanceStrategyAws

    constructor(provider: 'aws' | 'gcp') {
        this.provider = provider
        this.strategy = this.#createStrategy()
    }

    #createStrategy() {
        if (this.provider === 'aws') {
            return new InstanceStrategyAws()
        }
        throw new Error('Provider not supported')
    }

    getInstanceForContainerBuild(projectSlug: string): Promise<string> {
        return this.strategy.getInstanceForContainerBuild(projectSlug)
    }

    getInstanceForNewContainer(containerSlug: string): Promise<string> {
        return this.strategy.getInstanceForNewContainer(containerSlug)
    }

    waitTillInstanceReady(id: string): Promise<Instance> {
        return this.strategy.waitTillInstanceReady(id)
    }

    terminateInstance(id: string): Promise<void> {
        return this.strategy.terminateInstance(id)
    }

    exec(command: string, instanceId: string): Promise<string> {
        return this.strategy.exec(command, instanceId)
    }
}

export default InstanceStrategy
