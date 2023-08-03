import { setupContainerConsumer } from './container'
import { setupInstanceConsumer } from './instance/instance'

const consumers = () => {
    return Promise.all([setupInstanceConsumer(), setupContainerConsumer()])
}

consumers()
