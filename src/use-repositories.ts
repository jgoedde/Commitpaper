import { useCallback, useEffect, useState } from 'react'
import { githubApi, GitHubRepository } from './api/github-api.ts'

/**
 * A custom React hook to fetch and manage the top GitHub repositories for a user.
 *
 * @param {string} user - The GitHub username to fetch repositories for.
 * @param {number} [top=4] - The number of top repositories to return.
 * @returns An object containing the repositories and the loading state. The repos are sorted by activity score.
 */
export function useRepositories(user: string, top: number = 4) {
    const [isLoading, setIsLoading] = useState(true)

    /**
     * The user's top 5 GitHub repositories sorted by activity score, descending.
     */
    const [repositories, setRepositories] = useState<GitHubRepository[]>([])

    const loadRepositories = useCallback(async () => {
        setIsLoading(true)
        const repos = await githubApi.getRepositories(user)

        // Assign an activity score based on multiple factors
        const rankedRepositories = repos.map((repository) => ({
            ...repository,
            activityScore:
                (repository.pushed_at.getTime() -
                    repository.created_at.getTime()) /
                    (1000 * 60 * 60 * 24) + // Age activity
                repository.stargazers_count * 2 + // Star power (weighted more)
                repository.forks_count * 1.5 + // Forks indicate usage
                repository.open_issues_count + // Issues indicate engagement
                repository.watchers_count * 2, // Watchers show ongoing interest
        }))

        rankedRepositories.sort((a, b) => b.activityScore - a.activityScore)

        setIsLoading(false)
        setRepositories(rankedRepositories.slice(0, top))
    }, [top, user])

    useEffect(() => {
        void loadRepositories()
    }, [loadRepositories])

    return {
        repositories,
        isLoading,
    }
}
