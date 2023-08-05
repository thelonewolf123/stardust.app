import {
    setupDestroyContainerConsumer,
    setupNewContainerConsumer
} from './container'

const consumers = () => {
    return Promise.all([
        setupNewContainerConsumer(),
        setupDestroyContainerConsumer()
    ])
}

consumers()
