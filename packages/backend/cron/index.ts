import { CronJob } from 'cron'

import { instanceHealthCheck } from './controller'

export default function setupCrons() {
    const healthCron = new CronJob({
        onTick: instanceHealthCheck,
        cronTime: '*/5 * * * *'
    })

    healthCron.start()
}
