import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3
} from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { env } from '../env'

export const s3Client = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ''
    },
    region: 'us-east-1'
})

async function isFileExist(slug: string) {
    const cmd = new HeadObjectCommand({
        Bucket: env.CONTAINER_BUCKET_NAME,
        Key: slug
    })
    return s3Client.send(cmd)
}

async function uploadFile(slug: string, path: string) {
    const cmd = new PutObjectCommand({
        Bucket: env.CONTAINER_BUCKET_NAME,
        Key: slug,
        Body: readFileSync(path)
    })
    return s3Client.send(cmd)
}

async function deleteFile(slug: string, path: string) {
    const cmd = new DeleteObjectCommand({
        Bucket: env.CONTAINER_BUCKET_NAME,
        Key: slug
    })
    return s3Client.send(cmd)
}

async function downloadFile(slug: string, path: string) {
    const cmd = new GetObjectCommand({
        Bucket: env.CONTAINER_BUCKET_NAME,
        Key: slug
    })

    const data = await s3Client.send(cmd)
    if (!data.Body) return

    const body = await data.Body.transformToByteArray()
    writeFile(path, body)
}

export { downloadFile, uploadFile, deleteFile, isFileExist }
