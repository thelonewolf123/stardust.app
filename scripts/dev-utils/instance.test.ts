import ec2Aws from '../../packages/core/aws/ec2.aws'

async function main() {
    const [close, resultPromise] = await ec2Aws.execCommand({
        command: 'git',
        args: [
            'clone',
            'https://github.com/thelonewolf123/tools.cyberkrypts.dev',
            `/home/ubuntu/${Date.now()}`
        ],
        ipAddress: '52.91.100.121',
        cwd: '/home/ubuntu',
        sudo: true,
        onProgress: (data) => {
            console.log(data)
        }
    })

    const output = await resultPromise
    console.log(output)

    close()
}

main()
