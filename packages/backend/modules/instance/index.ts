import { Router } from 'express'

import { InstanceModel } from '../../database/models/instance'
import { requestEc2SpotInstance } from '../../library/aws/ec2'
import { NewInstanceSchema } from './validator'

const router = Router()

router.post('/api/instance', async (req, res) => {
    const { count, type } = NewInstanceSchema.parse(req.body)
    if (type === 'spot') {
        const response = await requestEc2SpotInstance(count)
        return res.json(response)
    }
    return res.status(400).json({ message: 'Invalid instance type' })
})

router.get('/api/instance', async (req, res) => {
    const instances = await InstanceModel.find({ status: 'running' }).lean()
    return res.json(instances)
})

export default router
