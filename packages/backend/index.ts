import bodyParser from 'body-parser'
import express from 'express'

import { env } from '../env'
import { requestEc2SpotInstance } from './aws/ec2'

const app = express()

app.use(bodyParser)

app.post('/api/create_ec2_instance', (req, res) => {
    const count = parseInt(req.body.count)
    return requestEc2SpotInstance(count)
})

app.get('/api/health', (req, res) => {
    return res.send('OK')
})

// app.get('/api/containers', (req, res) => {
//     return
// })

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started at ', process.env.PORT || 3000)
})
