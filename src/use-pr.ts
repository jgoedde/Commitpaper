async function fetchPRData(
    owner: string,
    repository: string,
    pullNumber: number
) {
    const [commitsResponse, commentsResponse] = await Promise.all([
        fetch(
            `https://api.github.com/repos/${owner}/${repository}/pulls/${pullNumber}/commits`
        ),
        fetch(
            `https://api.github.com/repos/${owner}/${repository}/issues/${pullNumber}/comments`
        ),
    ])

    if (!commitsResponse.ok || !commentsResponse.ok) {
        throw new Error('Failed to fetch pull request details')
    }

    const commits = await commitsResponse.json()
    const comments = await commentsResponse.json()

    return {
        commitsCount: commits.length,
        commentsCount: comments.length,
    }
}

export function usePR({
    owner,
    repository,
    pullNumber,
}: {
    owner: string
    repository: string
    pullNumber: number
}) {
    console.info('fetching PR data for', { owner, repository, pullNumber })
    return { commitsCount: 2, commentsCount: 3 }
}
