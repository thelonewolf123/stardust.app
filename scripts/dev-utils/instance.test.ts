import ec2Aws from '../../packages/core/aws/ec2.aws'

async function main() {
    ec2Aws
        .execCommand({
            command: 'podman',
            args: [
                'build',
                '-f',
                'docker/Dockerfile',
                '-t',
                'test',
                '--build-arg',
                'BRANCH=main',
                '--build-arg',
                `GITHUB_TOKEN=${process.env.GITHUB_TOKEN}`,
                '.'
            ],
            ipAddress: '3.90.10.7',
            cwd: '/home/ubuntu/app',
            sudo: true
        })
        .then(([close, promise]) => {
            setTimeout(close, 1500)
            return promise
        })
        .then((data) => {
            console.log(data)
        })

    ec2Aws
        .execCommand({
            command: 'ls',
            args: ['-la'],
            ipAddress: '3.90.10.7',
            sudo: true
        })
        .then(([close, promise]) => {
            return promise
        })
        .then((data) => {
            console.log(data)
        })
}

main()
