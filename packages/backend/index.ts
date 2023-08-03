import bodyParser from 'body-parser'
import express from 'express'

import setupCrons from './cron'
import { dbConnect } from './database/mongoose'
import containerRoute from './modules/container'
import instanceRoute from './modules/instance'

const app = express()

app.use(bodyParser)

app.get('/api/health', (req, res) => {
    return res.send('OK')
})

app.use(containerRoute)
app.use(instanceRoute)

async function start() {
    console.log('start server')
    await Promise.all([dbConnect(), setupCrons()])
    app.listen(process.env.PORT || 3000, () => {
        console.log('Server started at ', process.env.PORT || 3000)
    })
}

start()
