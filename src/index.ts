import { requestEc2SpotInstance } from './aws/ec2'

requestEc2SpotInstance(1).then((res) => {
    console.log(JSON.stringify(res, null, 4))
})
