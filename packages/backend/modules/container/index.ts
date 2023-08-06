import { Router } from 'express'
import { nanoid } from 'nanoid'

import { ContainerModel } from '../../database/models/containers'
import { NewContainerSchema } from './validator'

const router = Router()

router.get('/api/container', async (req, res) => {
    const allContainers = await ContainerModel.find({})
    return res.json(allContainers)
})

router.get('/api/container/:id', (req, res) => {
    const { id } = req.params
    const container = ContainerModel.findById(id)
    return res.json(container)
})

router.post('/api/container', (req, res) => {
    const { image, command, env, ports } = NewContainerSchema.parse(req.body)
    ContainerModel.create({
        containerSlug: nanoid(),
        image,
        status: 'scheduled'
    })
    return res.send('Container')
})

router.put('/api/container/:id', (req, res) => {
    return res.send('Container')
})

router.delete('/api/container/:id', (req, res) => {
    return res.send('Container')
})

export default router
