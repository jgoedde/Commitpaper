import { GitHubPullRequest } from './use-top-repos.ts'
import { formatDistanceToNow } from 'date-fns'
import { useMemo } from 'react'
import { usePR } from './use-pr.ts'
import { de } from 'date-fns/locale'
import { getRandomHex } from './color-utils.ts'

export function PrActivityHeadline({ pr }: { pr: GitHubPullRequest }) {
    const { commitsCount, commentsCount } = usePR({
        owner: pr.user.login,
        repo: pr.repo,
        pullNumber: pr.id,
    })

    const body = useMemo(() => {
        if (pr.body_text == null) {
            return ''
        }

        const maxLength = 400
        const text = pr.body_text.trim()
        if (text.length <= maxLength) {
            return text
        }
        const truncatedText = text.slice(0, maxLength)
        return truncatedText + '...'
    }, [pr])

    return (
        <div className={'space-y-3'}>
            <h3 className={'font-headline text-center text-xl/5 font-bold'}>
                {pr.title}
            </h3>
            <p className={'my-5 text-sm italic'}>Von {pr.user.login}</p>
            <div className={'text-sm whitespace-pre-line'}>
                <b>
                    {pr.created_at.toLocaleTimeString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour12: false,
                        hour: 'numeric',
                        minute: 'numeric',
                    })}{' '}
                    Uhr
                </b>
                {body.trim() !== '' && (
                    <>
                        , {body}
                        <br />
                        <br />
                    </>
                )}
                Der Pull Request weist <b>{commitsCount} Commits</b> auf und er
                erhielt <b>{commentsCount} Kommentare</b> seit seiner
                Erstellung. Er ist damit also eher klein.
            </div>
            <div className={'my-6 flex items-center space-x-2 text-sm'}>
                <div
                    className={`size-3`}
                    style={{ backgroundColor: '#' + getRandomHex(6) }}
                />
                <span className={''}>{pr.repo}</span>
            </div>
            <div
                className={
                    'flex items-center justify-between gap-2 space-x-1 text-end text-sm'
                }
            >
                <div className="bg-black p-1 text-white">{pr.state}</div>
                <span>
                    Letztes Update{' '}
                    {formatDistanceToNow(pr.updated_at, {
                        includeSeconds: false,
                        addSuffix: true,
                        locale: de,
                    })}
                </span>
            </div>
        </div>
    )
}
