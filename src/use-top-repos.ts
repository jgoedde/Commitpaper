import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { addDays } from 'date-fns'

const GitHubRepoSchema = z.object({
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

type GitHubRepo = z.infer<typeof GitHubRepoSchema>

const GitHubPRSchema = z.object({
    id: z.number(),
    title: z.string(),
    body_text: z.string().nullable(),
    state: z.enum(['open', 'closed']),
    updated_at: z.coerce.date(),
    created_at: z.coerce.date(),
    user: z.object({
        login: z.string(),
    }),
})

const GitHubCommitSchema = z.object({
    author: z.object({ login: z.string() }),
    commit: z.object({
        message: z.string(),
        committer: z.object({ date: z.coerce.date() }),
    }),
})

export type GitHubPullRequest = z.infer<typeof GitHubPRSchema> & {
    type: 'pull'
    repo: string
}
export type GitHubCommit = z.infer<typeof GitHubCommitSchema> & {
    type: 'commit'
    repo: string
}

export type GitHubActivity = (GitHubPullRequest | GitHubCommit) & {
    repo: string
}

export function useTopRepos(user: string) {
    const [isLoading, setIsLoading] = useState(true)
    /**
     * The user's top 5 GitHub repositories sorted by activity score, descending.
     */
    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [activities, setActivities] = useState<GitHubActivity[]>([])

    const loadRepos = useCallback(async () => {
        setIsLoading(true)
        const response = await fetch(
            // `https://api.github.com/users/${user}/repos`
            `/repos.json?user=${user}`
        )

        if (!response.ok) {
            throw new Error('Failed to fetch repos')
        }

        const data = await response.json()
        const parsedData = z.array(GitHubRepoSchema).parse(data)

        // Assign an activity score based on multiple factors
        const rankedRepos = parsedData.map((repo) => ({
            ...repo,
            activityScore:
                (repo.pushed_at.getTime() - repo.created_at.getTime()) /
                    (1000 * 60 * 60 * 24) + // Age activity
                repo.stargazers_count * 2 + // Star power (weighted more)
                repo.forks_count * 1.5 + // Forks indicate usage
                repo.open_issues_count + // Issues indicate engagement
                repo.watchers_count * 2, // Watchers show ongoing interest
        }))

        rankedRepos.sort((a, b) => b.activityScore - a.activityScore)

        setRepos(rankedRepos.slice(0, 4))
    }, [user])

    useEffect(() => {
        void loadRepos()
    }, [loadRepos])

    const getLatestPull = useCallback(
        async (repository: string) => {
            setIsLoading(true)
            const response = await fetch(
                // `https://api.github.com/repos/${user}/${repository}/pulls?per_page=5&state=all`,
                `/prs.json?repository=${repository}&user=${user}`,
                {
                    method: 'GET',
                    headers: { Accept: 'application/vnd.github.text+json' },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch pull requests')
            }

            const data = await response.json()
            const parsedData = z.array(GitHubPRSchema).parse(data)

            return parsedData[0]
        },
        [user]
    )

    const getLatestCommit = useCallback<
        (repo: string) => Promise<GitHubActivity>
    >(
        async (repo) => {
            const response = await fetch(
                `https://api.github.com/repos/${user}/${repo}/commits?per_page=1&committer=${user}`
            )

            const dummyCommit: GitHubCommit = {
                commit: {
                    message: 'This is a dummy commit message',
                    committer: { date: addDays(new Date(), -2) },
                },
                author: { login: 'aUser' },
                type: 'commit',
                repo,
            }
            if (!response.ok) {
                return Promise.resolve(dummyCommit)
                // throw new Error('Failed to fetch commits')
            }

            const data = await response.json()

            const res: GitHubActivity = {
                ...(z.array(GitHubCommitSchema).parse(data)?.[0] ??
                    dummyCommit),
                repo,
                type: 'commit',
            }

            return res
        },
        [user]
    )

    useEffect(() => {
        const fetchPulls = async () => {
            const activities: GitHubActivity[] = (
                await Promise.all(
                    repos.map(async (repo) => {
                        const pull = await getLatestPull(repo.name)
                        return pull
                            ? ({
                                  ...pull,
                                  type: 'pull',
                                  repo: repo.name,
                              } as GitHubActivity)
                            : null
                    })
                )
            ).filter((x) => x != null) as GitHubActivity[]

            // check for all repos and see if there are any missing
            const missingRepos = repos.filter((repo) =>
                activities.every((activity) => activity?.repo !== repo.name)
            )

            activities.push(
                ...((await Promise.all(
                    missingRepos.map(async (repo) => {
                        const commit = await getLatestCommit(repo.name)
                        return commit
                            ? ({
                                  ...commit,
                                  type: 'commit',
                                  repo: repo.name,
                              } as GitHubActivity)
                            : null
                    })
                )) as GitHubActivity[])
            )

            setActivities(
                activities.filter((a) => a !== null) as GitHubActivity[]
            )
            setIsLoading(false)
        }

        void fetchPulls()
    }, [getLatestCommit, getLatestPull, repos])

    return {
        activities,
        isLoading,
    }
}
