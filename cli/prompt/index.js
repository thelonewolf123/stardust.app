// @ts-check
import inquirer from 'inquirer'

export async function getLoginInput() {
    const input = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter your username'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password',
            mask: '*'
        }
    ])

    return input
}

export async function getNewContainerInput() {
    const input = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the container'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Enter the description of the container'
        },
        {
            type: 'input',
            name: 'dockerContext',
            message: 'Enter the docker context',
            default: '.'
        },
        {
            type: 'input',
            name: 'dockerPath',
            message: 'Enter the docker path',
            default: './Dockerfile'
        },
        {
            type: 'input',
            name: 'githubBranch',
            message: 'Enter the github branch',
            default: 'main'
        },
        {
            type: 'input',
            name: 'port',
            message: 'Enter the port',
            default: 8000
        },
        {
            type: 'input',
            name: 'githubUrl',
            message: 'Enter the github url'
        }
    ])

    return input
}
