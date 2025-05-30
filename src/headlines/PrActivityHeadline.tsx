import { formatDistanceToNow } from 'date-fns'
import { useMemo } from 'react'
import { de } from 'date-fns/locale'
import { getRandomHex } from '../color-utils.ts'
import { GitHubPullRequest } from '../use-repository-activities.ts'

export function PrActivityHeadline({ pr }: { pr: GitHubPullRequest }) {
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

    const prSize = useMemo(() => {
        return (
            Object.entries(PR_SIZE_MAP).find(([key]) => {
                return pr.changedFiles <= parseInt(key)
            })?.[1] ?? 'sehr groß'
        )
    }, [pr.changedFiles])

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
                {body.trim() !== '' && <>, {body}</>}
                <br />
                <br />
                <div>
                    <span>
                        Der Pull Request wurde von {pr.user.login} erstellt und
                        umfasst insgesamt{' '}
                        <em>{pr.changedFiles} geänderte Dateien</em>.&nbsp;
                    </span>
                    {pr.comments > 0 && (
                        <span>
                            Seit seiner Erstellung wurde er mit {pr.comments}{' '}
                            Kommentaren diskutiert.&nbsp;
                        </span>
                    )}
                    <span>
                        Auf Basis der geänderten Dateien lässt sich der Umfang
                        des Pull Requests als <em>{prSize}</em> einstufen.
                    </span>
                </div>
            </div>
            <div className={'my-6 flex items-center space-x-2 text-sm'}>
                <div
                    className={`size-3`}
                    style={{ backgroundColor: '#' + getRandomHex(6) }}
                />
                <span>{pr.repository}</span>
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

const PR_SIZE_MAP = {
    3: 'eher klein',
    5: 'klein',
    10: 'mittelgroß',
    20: 'groß',
}
