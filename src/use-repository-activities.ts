import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from './use-repositories.ts'
import {
    githubApi,
    GitHubCommitResponse,
    GitHubPRResponse,
} from './api/github-api.ts'

export function useRepositoryActivities(user: string) {
    const { repositories, isLoading: areRepositoriesLoading } =
        useRepositories(user)

    const [isLoading, setIsLoading] = useState(true)
    const [activities, setActivities] = useState<GitHubActivity[]>([])

    /**
     * Load the activities for the repositories.
     * This will load the latest pull requests and commits for each repository.
     * If a repository has no pull requests, it will load the latest commit.
     */
    const loadActivities = useCallback(async () => {
        setIsLoading(true)

        const activities: (GitHubActivity | null)[] = []

        // load the PRs first
        for (const repository of repositories) {
            try {
                const pull = await githubApi.getLatestPull(
                    user,
                    repository.name
                )

                if (pull) {
                    activities.push(pull)
                } else {
                    activities.push(null)
                }
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
                const commit = await githubApi.getLatestCommit(
                    user,
                    repositories[index].name
                )

                if (commit) {
                    activities[index] = commit
                }
            } catch (e) {
                console.error(e)
            }
        }

        setIsLoading(false)
        setActivities(activities.filter((a) => a !== null) as GitHubActivity[])
    }, [repositories, user])

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

export type GitHubPullRequest = GitHubPRResponse & {
    type: 'pull'
    repository: string
    changedFiles: number
    comments: number
}

export type GitHubCommit = GitHubCommitResponse & {
    type: 'commit'
    repository: string
}

export type GitHubActivity = GitHubPullRequest | GitHubCommit
