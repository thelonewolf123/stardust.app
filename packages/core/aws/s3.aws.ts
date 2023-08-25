import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'

import { env } from '@/env'
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3
} from '@aws-sdk/client-s3'

export const s3Client = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ''
    },
    region: env.AWS_REGION
})

async function isFileExist(slug: string, bucketName: string) {
    const cmd = new HeadObjectCommand({
        Bucket: bucketName,
        Key: slug
    })
    return s3Client.send(cmd)
}

async function uploadFile(slug: string, path: string, bucketName: string) {
    const cmd = new PutObjectCommand({
        Bucket: bucketName,
        Key: slug,
        Body: readFileSync(path)
    })
    return s3Client.send(cmd)
}

async function deleteFile(slug: string, path: string, bucketName: string) {
    const cmd = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: slug
    })
    return s3Client.send(cmd)
}

async function downloadFile(slug: string, path: string, bucketName: string) {
    const cmd = new GetObjectCommand({
        Bucket: bucketName,
        Key: slug
    })

    const data = await s3Client.send(cmd)
    if (!data.Body) return

    const body = await data.Body.transformToByteArray()
    writeFile(path, body)
}

async function downloadFileBuffer(slug: string, bucketName: string) {
    const cmd = new GetObjectCommand({
        Bucket: bucketName,
        Key: slug
    })

    const data = await s3Client.send(cmd)
    if (!data.Body) return

    const body = await data.Body.transformToByteArray()
    return body
}

export default function s3Aws(bucketName: string) {
    return {
        isFileExist: (slug: string) => isFileExist(slug, bucketName),
        uploadFile: (slug: string, path: string) =>
            uploadFile(slug, path, bucketName),
        deleteFile: (slug: string) => deleteFile(slug, slug, bucketName),
        downloadFile: (slug: string, path: string) =>
            downloadFile(slug, path, bucketName),
        downloadFileBuffer: (slug: string) =>
            downloadFileBuffer(slug, bucketName)
    }
}
