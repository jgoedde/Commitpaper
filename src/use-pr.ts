async function fetchPRData(owner: string, repo: string, pullNumber: number) {
    const [commitsResponse, commentsResponse] = await Promise.all([
        fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/commits`
        ),
        fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`
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
    repo,
    pullNumber,
}: {
    owner: string
    repo: string
    pullNumber: number
}) {
    console.info('fetching PR data for', { owner, repo, pullNumber })
    return { commitsCount: 2, commentsCount: 3 }
}
