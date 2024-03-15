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

async function listBranches(username: string, repo: string, token: string) {
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
    repo: string,
    webhook_url: string,
    token: string
) {
    const octokit = new Octokit({
        auth: token
    })

    const [owner, repoName] = repo.split('/')
    const response = await octokit.repos.createWebhook({
        owner,
        repo: repoName,
        config: {
            url: webhook_url,
            content_type: 'json'
        }
    })

    return response.data
}

export function git(username: string, token: string) {
    return {
        listRepositories: () => listRepositories(username, token),
        listBranches: (repo: string) => listBranches(username, repo, token),
        addWebhook: (repo: string, webhook_url: string) =>
            addWebhook(username, repo, webhook_url, token)
    }
}
