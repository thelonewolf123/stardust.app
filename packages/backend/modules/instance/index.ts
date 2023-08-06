import { Router } from 'express'

import ec2 from '../../../scheduler/library/ec2.aws'
import { InstanceModel } from '../../database/models/instance'
import { NewInstanceSchema } from './validator'

const router = Router()

router.post('/api/instance', async (req, res) => {
    const { count, type } = NewInstanceSchema.parse(req.body)
    if (type === 'spot') {
        const response = await ec2.requestEc2SpotInstance(count)
        return res.json(response)
    }
    return res.status(400).json({ message: 'Invalid instance type' })
})

router.get('/api/instance', async (req, res) => {
    const instances = await InstanceModel.find({ status: 'running' }).lean()
    return res.json(instances)
})

export default router
