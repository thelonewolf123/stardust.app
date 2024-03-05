import chalk from 'chalk'
import EventSource from 'eventsource'
import { getContainerLogsInput } from '../prompt/index.js'
import { BASE_URL } from '../client/index.js'

/**
 *
 * @param {String} containerSlug
 */
export async function getContainerLogs(containerSlug) {
    const source = new EventSource(
        `${BASE_URL}/container/${containerSlug}/logs`
    )
    const headingStyle = chalk.bold.underline
    console.log(headingStyle('Container Logs:'))
    source.addEventListener('message', (event) => {
        console.log(event.data)
    })

    source.addEventListener('error', (event) => {
        if (event.status === EventSource.CLOSED) {
            console.log('Connection closed'.red.bold)
            process.exit(0)
        } else {
            console.error('Error occurred'.red.bold, event)
            process.exit(1)
        }
    })
}

export async function getContainerLogsHandler() {
    getContainerLogsInput()
        .then((input) => getContainerLogs(input.containerSlug))
        .then(() => {
            console.log('Container logs fetched successfully'.green.bold)
        })
        .catch((err) => {
            if (err.response)
                console.error(
                    'Container logs failed'.red.bold,
                    `${err.response.errors[0].message}`.yellow
                )
            else
                console.error(
                    'Container logs failed'.red.bold,
                    `${err.message}`.yellow
                )
        })
}
