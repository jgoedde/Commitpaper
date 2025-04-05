import useSWRImmutable from 'swr/immutable'

export function usePR({
    owner,
    repository,
    pullNumber,
}: {
    owner: string
    repository: string
    pullNumber: number
}): { filesCount: number; commentsCount: number; hasError: boolean } {
    const { data: files, error: filesError } = useSWRImmutable<number>( // Immutable to not drain rate limit
        `https://api.github.com/repos/${owner}/${repository}/pulls/${pullNumber}/files`,
        fetcher
    )

    const { data: comments, error: commentsError } = useSWRImmutable<number>( // Immutable to not drain rate limit
        `https://api.github.com/repos/${owner}/${repository}/pulls/${pullNumber}/comments`,
        fetcher
    )

    const filesCount = files ?? 0
    const commentsCount = comments ?? 0

    return {
        filesCount,
        commentsCount,
        hasError: filesError || commentsError,
    }
}

/**
 * Fetches data from the given URL and returns the length of the data array.
 *
 * @throws {Error} - Throws an error if the fetch operation fails.
 */
const fetcher: (url: string) => Promise<number> = async (url) => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${url}`)
    }

    const data: unknown[] = await response.json()
    return data.length
}
