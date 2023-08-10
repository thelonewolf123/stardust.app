import { spawn } from 'child_process'
import path from 'path'

import { env } from '../env'

async function startContainer(imageName: string) {
    const ps = spawn('podman', ['run', '--rm', '-d', imageName])
    let containerId = ''
    ps.stdout.on('data', (chunk) => (containerId += chunk))
    await new Promise((r) => ps.on('exit', r))
    return containerId
}

async function killContainer(containerId: string) {
    const ps = spawn('podman', ['kill', containerId])
    await new Promise((r) => ps.on('exit', r))
    return containerId
}

async function createCheckpoint(containerId: string) {
    const backup = path.join(env.CHECKPOINT_PATH, `${containerId}.tar.gz`)
    const ps = spawn('podman', [
        'container',
        'checkpoint',
        containerId,
        '-e',
        backup
    ])
    await new Promise((resolve, reject) => {
        ps.on('error', (error) => reject(error))
        ps.on('exit', resolve)
    })
    return backup
}

async function restoreCheckpoint(backupFileName: string) {
    const backupFullPath = path.join(env.CHECKPOINT_PATH, backupFileName)
    const ps = spawn('podman', ['container', 'restore', '-i', backupFullPath])
    await new Promise((resolve, reject) => {
        ps.on('error', (error) => reject(error))
        ps.on('exit', resolve)
    })
    let containerId = ''
    ps.stdout.on('data', (chunk) => (containerId += chunk))
    return containerId
}

async function getAllContainers() {
    // podman ps -a -q
    const ps = spawn('podman', ['ps', '-q'])
    let containerIds = ''
    ps.stdout.on('data', (chunk) => (containerIds += chunk))
    await new Promise((r) => ps.on('exit', r))
    return containerIds.split('\n').filter(Boolean)
}

export {
    startContainer,
    killContainer,
    createCheckpoint,
    restoreCheckpoint,
    getAllContainers
}

// https://docs.podman.io/en/latest/_static/api.html#tag/containers/operation/ContainerCheckpointLibpod
