import { spawn } from 'child_process'
import { v4 } from 'uuid'

async function startContainer(imageName: string) {
    const ps = spawn('podman', ['run', '--rm', '-d', imageName])
    let containerId = ''
    ps.stdout.on('data', (chunk) => (containerId += chunk))
    await new Promise((r) => ps.on('exit', r))
    return containerId
}

async function deleteContainer(containerId: string) {
    const ps = spawn('podman', ['kill', containerId])
    await new Promise((r) => ps.on('exit', r))
    return containerId
}

async function createCheckpoint(containerId: string) {
    const backup = `${v4()}.tar.gz`
    const ps = spawn('podman', [
        'container',
        'checkpoint',
        containerId,
        '-e',
        backup
    ])

    await new Promise((r) => ps.on('exit', r))
    return backup
}

async function restoreCheckpoint(backupFileName: string) {
    const ps = spawn('podman', ['container', 'restore', '-i', backupFileName])
    await new Promise((r) => ps.on('exit', r))
    let containerId = ''
    ps.stdout.on('data', (chunk) => (containerId += chunk))
    return containerId
}

export { startContainer, deleteContainer, createCheckpoint, restoreCheckpoint }
