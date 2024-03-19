import invariant from 'invariant'

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
    githubUrl: string,
    webhook_url: string,
    token: string
) {
    const octokit = new Octokit({
        auth: token
    })

    const repo = githubUrl.split('github.com/').at(-1)
    invariant(repo, 'Invalid github url')

    const [_, repoName] = repo.split('/')
    const response = await octokit.repos.createWebhook({
        owner: username,
        repo: repoName,
        config: {
            url: webhook_url,
            content_type: 'json'
        },
        events: ['push']
    })

    return response.data
}

export function git(username: string, token: string) {
    return {
        listRepositories: () => listRepositories(username, token),
        listBranches: (repo: string) => listBranches(username, repo, token),
        addWebhook: (githubUrl: string, webhook_url: string) =>
            addWebhook(username, githubUrl, webhook_url, token)
    }
}
