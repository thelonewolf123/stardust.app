import { Octokit } from '@octokit/rest'

async function listRepositories(username: string, token: string) {
    const octokit = new Octokit({
        auth: token
    })
    // list private and public repositories
    const response = await octokit.repos.listForAuthenticatedUser({
        username: username,
        per_page: 10_000,
        sort: 'updated'
    })

    const repositories = response.data.map((repo) => repo.full_name)
    return repositories
}

async function listBranches(username: string, token: string, repo: string) {
    const octokit = new Octokit({
        auth: token
    })

    const repoName = repo.split('/').at(-1) || repo
    const response = await octokit.repos.listBranches({
        owner: username,
        repo: repoName
    })

    const branches = response.data.map((branch) => branch.name)
    return branches
}

async function addWebhook(
    username: string,
    token: string,
    github_url: string,
    webhook_url: string
) {
    const octokit = new Octokit({
        auth: token
    })

    const repo = new URL(github_url).pathname
    const [_, repoName] = repo.split('/')

    try {
        const response = await octokit.repos.createWebhook({
            owner: username,
            repo: repoName,
            config: {
                url: webhook_url,
                content_type: 'json'
            },
            events: ['push']
        })

        return response.status === 201
    } catch (error) {
        console.log(error)
        return false
    }
}

export function git(username: string, token: string) {
    return {
        listRepositories: () => listRepositories(username, token),
        listBranches: (repo: string) => listBranches(username, token, repo),
        addWebhook: (github_url: string, webhook_url: string) =>
            addWebhook(username, token, github_url, webhook_url)
    }
}
