import { requestEc2SpotInstance } from './aws/ec2'

function start() {
    return requestEc2SpotInstance(1)
}

start()
