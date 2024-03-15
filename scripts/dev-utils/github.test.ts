import { git } from '../../packages/backend/library/github'
import { env } from '../../packages/env'

async function main() {
    const client = git('thelonewolf123', env.GITHUB_TOKEN)
    const list = await client.listRepositories()
    console.log(list)

    const branches = await client.listBranches(list[0])
    console.log(branches)
}

main()
