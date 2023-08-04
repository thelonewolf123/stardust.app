import { CronJob } from 'cron'

import { instanceHealthCheck } from './controller'

export default function main() {
    const healthCron = new CronJob({
        onTick: instanceHealthCheck,
        cronTime: '*/5 * * * *'
    })

    healthCron.start()
}

// start crons
main()
