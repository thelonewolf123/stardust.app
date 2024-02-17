import { CronJob } from 'cron'

import * as mongodb from '@/backend/database/mongoose'

import redis from '../core/redis'
import {
    containerCleanup,
    instanceCleanup,
    instanceHealthCheck
} from './controller'

function setup() {
    return Promise.all([mongodb.connect(), redis.connect()])
}
export default function main() {
    const healthCron = new CronJob({
        onTick: instanceHealthCheck,
        cronTime: '*/5 * * * *'
    })
    healthCron.start()

    const instanceCleanupCron = new CronJob({
        onTick: instanceCleanup,
        cronTime: '*/1 * * * *'
    })
    instanceCleanupCron.start()

    const containerCleanupCron = new CronJob({
        onTick: containerCleanup,
        cronTime: '*/1 * * * *'
    })
    containerCleanupCron.start()
}

setup().then(() => {
    // start crons
    console.log('cron started')
    main()
})
