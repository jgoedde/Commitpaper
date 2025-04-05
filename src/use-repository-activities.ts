import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { useRepositories } from './use-repositories.ts'

export function useRepositoryActivities(user: string) {
    const { repositories, isLoading: areRepositoriesLoading } =
        useRepositories(user)

    const [isLoading, setIsLoading] = useState(true)
    const [activities, setActivities] = useState<GitHubActivity[]>([])

    const getLatestPull = useCallback<
        (repository: string) => Promise<GitHubActivity | undefined>
    >(
        async (repository) => {
            setIsLoading(true)
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
            const parsedData = z.array(GitHubPRSchema).safeParse(data).data

            const latest = parsedData?.[0]

            return latest
                ? ({
                      ...latest,
                      type: 'pull',
                      repository,
                  } as GitHubActivity)
                : undefined
        },
        [user]
    )

    const getLatestCommit = useCallback<
        (repository: string) => Promise<GitHubActivity | undefined>
    >(
        async (repository) => {
            const response = await fetch(
                `https://api.github.com/repos/${user}/${repository}/commits?per_page=1`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch commits')
            }

            const data = await response.json()

            const latest = z.array(GitHubCommitSchema).safeParse(data).data?.[0]

            return latest
                ? {
                      ...latest,
                      repository,
                      type: 'commit',
                  }
                : undefined
        },
        [user]
    )

    /**
     * Load the activities for the repositories.
     * This will load the latest pull requests and commits for each repository.
     * If a repository has no pull requests, it will load the latest commit.
     */
    const loadActivities = useCallback<() => Promise<void>>(async () => {
        const activities: (GitHubActivity | null)[] = []

        // load the PRs first
        for (const repository of repositories) {
            try {
                const pull = await getLatestPull(repository.name)
                if (!pull) {
                    activities.push(null)
                    continue
                }

                activities.push({
                    ...pull,
                    type: 'pull',
                    repository: repository.name,
                } as GitHubActivity)
            } catch (e) {
                console.error(e)
                activities.push(null)
            }
        }

        // If there is only a pull request for second repository, we need to load the commits for the first, third and fourth one.
        // activities array will be like this then: [null, pull request, null, null]
        for (const [index, activity] of activities.entries()) {
            if (activity !== null) {
                continue
            }

            try {
                const commit = await getLatestCommit(repositories[index].name)

                if (!commit) {
                    activities[index] = null
                    continue
                }

                activities[index] = commit
            } catch (e) {
                console.error(e)
            }
        }

        setActivities(activities.filter((a) => a !== null) as GitHubActivity[])
        setIsLoading(false)
    }, [getLatestCommit, getLatestPull, repositories])

    useEffect(() => {
        if (areRepositoriesLoading) {
            setIsLoading(true)
            return
        }
        void loadActivities()
    }, [areRepositoriesLoading, loadActivities, repositories])

    return {
        activities,
        isLoading,
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

const GitHubCommitSchema = z.object({
    author: z.object({ login: z.string() }),
    commit: z.object({
        message: z.string(),
        committer: z.object({ date: z.coerce.date() }),
    }),
})

export type GitHubPullRequest = z.infer<typeof GitHubPRSchema> & {
    type: 'pull'
    repository: string
}
export type GitHubCommit = z.infer<typeof GitHubCommitSchema> & {
    type: 'commit'
    repository: string
}

export type GitHubActivity = (GitHubPullRequest | GitHubCommit) & {
    repository: string
}
