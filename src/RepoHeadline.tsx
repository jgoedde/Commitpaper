import { GitHubActivity } from './use-top-repos.ts'
import { formatDistanceToNow } from 'date-fns'
import { useMemo } from 'react'
import { usePR } from './use-pr.ts'
import { de } from 'date-fns/locale'

function getRandomHex(size: number): string {
    return [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')
}

export function RepoHeadline({ activity }: { activity: GitHubActivity }) {
    const { commitsCount, commentsCount } = usePR({
        owner: activity.user.login,
        repo: activity.repo,
        pullNumber: activity.id,
    })
    const body = useMemo(() => {
        if (activity.body_text == null) {
            return ''
        }

        const maxLength = 400
        const text = activity.body_text.trim()
        if (text.length <= maxLength) {
            return text
        }
        const truncatedText = text.slice(0, maxLength)
        return truncatedText + '...'
    }, [activity])

    return (
        <div className={'space-y-3'}>
            <h3 className={'font-headline text-center text-xl/5 font-bold'}>
                {activity.title}
            </h3>
            <p className={'my-5 text-sm italic'}>Von {activity.user.login}</p>
            <div className={'text-sm whitespace-pre-line'}>
                <b>
                    {activity.created_at.toLocaleTimeString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour12: false,
                        hour: 'numeric',
                        minute: 'numeric',
                    })}
                </b>
                ,{' '}
                {body.trim() !== '' && (
                    <>
                        {body}
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
                <span className={''}>{activity.repo}</span>
            </div>
            <div
                className={
                    'flex items-center justify-between gap-2 space-x-1 text-end text-sm'
                }
            >
                <div className="bg-black p-1 text-white">{activity.state}</div>
                <span>
                    Letztes Update{' '}
                    {formatDistanceToNow(activity.updated_at, {
                        includeSeconds: false,
                        addSuffix: true,
                        locale: de,
                    })}
                </span>
            </div>
        </div>
    )
}
