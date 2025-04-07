import { z } from 'zod'
import {
    GitHubCommit,
    GitHubPullRequest,
} from '../use-repository-activities.ts'

export const githubApi = {
    getLatestPull,
    getLatestCommit,
    getRepositories,
}

/**
 * Fetches the repositories of a user.
 * Always returns an empty array if the fetch fails.
 */
async function getRepositories(user: string): Promise<GitHubRepository[]> {
    const response = await fetch(`https://api.github.com/users/${user}/repos`)

    if (!response.ok) {
        console.error(`Failed to fetch repositories for user: ${user}`)
        return []
    }

    const data = await response.json()
    return z.array(GitHubRepositorySchema).safeParse(data)?.data ?? []
}

/**
 * Fetches the number of changed files in a pull request.
 *
 * @throws {Error|z.ZodError} - If the fetch operation fails or if the response is not valid.
 */
async function getChangedFilesInPull(
    user: string,
    repository: string,
    pullNumber: number
): Promise<number> {
    const response = await fetch(
        `https://api.github.com/repos/${user}/${repository}/pulls/${pullNumber}/files`
    )

    if (!response.ok) {
        throw new Error('Failed to fetch pull request files')
    }

    const data = await response.json()
    return z.array(z.unknown()).parse(data).length
}

/**
 * Fetches the number of changed files and comments in a pull request.
 *
 * @throws {Error|z.ZodError} - If it's unable to fetch the changed files or comments.
 */
async function getPullDetails(
    user: string,
    repository: string,
    pullNumber: number
): Promise<{ changedFiles: number; comments: number }> {
    const [changedFiles, comments] = await Promise.all([
        getChangedFilesInPull(user, repository, pullNumber),
        getPullComments(user, repository, pullNumber),
    ])

    return { changedFiles, comments }
}

/**
 * Fetches the number of comments in a pull request.
 *
 * @throws {Error|z.ZodError} - If the fetch operation fails or if the response is not valid.
 */
async function getPullComments(
    user: string,
    repository: string,
    pullNumber: number
): Promise<number> {
    const response = await fetch(
        `https://api.github.com/repos/${user}/${repository}/pulls/${pullNumber}/comments`
    )
    if (!response.ok) {
        throw new Error('Failed to fetch pull request comments')
    }

    const data: unknown[] = await response.json()
    return z.array(z.unknown()).parse(data).length
}

/**
 * Fetches last 5 pull requests from a repository.
 *
 * @throws {Error|z.ZodError} - If the fetch operation fails or if the response is not valid.
 */
async function getPulls(
    user: string,
    repository: string
): Promise<GitHubPRResponse[]> {
    const response = await fetch(
        `https://api.github.com/repos/${user}/${repository}/pulls?per_page=5&state=all`,
        {
            method: 'GET',
            headers: { Accept: 'application/vnd.github.text+json' },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch pull requests')
    }

    const data = await response.json()
    return z.array(GitHubPRSchema).parse(data)
}

/**
 * Fetches the latest pull request from a repository.
 * Returns null if no pull requests are found or if the fetch fails.
 */
async function getLatestPull(
    user: string,
    repository: string
): Promise<GitHubPullRequest | null> {
    try {
        const pulls = await getPulls(user, repository)
        const latest = pulls[0]

        if (!latest) {
            return null
        }

        const { changedFiles, comments } = await getPullDetails(
            user,
            repository,
            latest.number
        )

        return {
            ...latest,
            type: 'pull',
            repository,
            changedFiles,
            comments,
        }
    } catch (e) {
        console.error(e)
        return null
    }
}

/**
 * Fetches the latest commit from a repository.
 * Returns null if no commits are found or if the fetch fails.
 */
async function getLatestCommit(
    user: string,
    repository: string
): Promise<GitHubCommit | null> {
    const response = await fetch(
        `https://api.github.com/repos/${user}/${repository}/commits?per_page=1`
    )

    if (!response.ok) {
        return null
    }

    const data = await response.json()

    const latest = z.array(GitHubCommitSchema).parse(data)?.[0]

    if (!latest) {
        return null
    }

    return {
        ...latest,
        repository,
        type: 'commit',
    }
}

const GitHubPRSchema = z.object({
    number: z.number(),
    title: z.string(),
    body_text: z.string().nullable(),
    state: z.enum(['open', 'closed']),
    updated_at: z.coerce.date(),
    created_at: z.coerce.date(),
    user: z.object({
        login: z.string(),
    }),
})

export type GitHubPRResponse = z.infer<typeof GitHubPRSchema>

const GitHubCommitSchema = z.object({
    author: z.object({ login: z.string() }),
    commit: z.object({
        message: z.string(),
        committer: z.object({ date: z.coerce.date() }),
    }),
})

export type GitHubCommitResponse = z.infer<typeof GitHubCommitSchema>

const GitHubRepositorySchema = z.object({
    id: z.number(),
    html_url: z.string(),
    pushed_at: z.coerce.date(),
    created_at: z.coerce.date(),
    stargazers_count: z.number(),
    forks_count: z.number(),
    open_issues_count: z.number(),
    watchers_count: z.number(),
    name: z.string(),
})

export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>
