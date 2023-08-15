import { CronJob } from 'cron'

import { instanceCleanup, instanceHealthCheck } from './controller'

export default function main() {
    const healthCron = new CronJob({
        onTick: instanceHealthCheck,
        cronTime: '*/5 * * * *'
    })
    healthCron.start()

    const cleanupCron = new CronJob({
        onTick: instanceCleanup,
        cronTime: '*/1 * * * *'
    })
    cleanupCron.start()
}

// start crons
main()
