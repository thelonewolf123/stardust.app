import { git } from '../../packages/backend/library/github'
import { env } from '../../packages/env'

async function main() {
    const client = git('thelonewolf123', env.GITHUB_TOKEN)
    const list = await client.listRepositories()
    console.log(list)

    const branches = await client.listBranches(list[0])
    const result = await client.addWebhook(
        'thelonewolf123/pocketbase',
        'https://webhook.site/a675d021-310a-44a4-9b49-b0870dd50f72'
    )
    console.log(result)
}

main()
