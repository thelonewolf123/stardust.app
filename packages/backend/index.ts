import express from 'express'
import bodyParser from 'body-parser'
import { requestEc2SpotInstance } from './aws/ec2'

const app = express()

app.use(bodyParser)

app.post('/api/create_ec2_instance', (req, res) => {
    const count = parseInt(req.body.count)
    return requestEc2SpotInstance(count)
})

app.listen(process.env.PORT || 3000)
