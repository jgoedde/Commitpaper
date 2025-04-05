import { GitHubCommit } from '../use-repository-activities.ts'
import { getRandomHex } from '../color-utils.ts'
import { useMemo } from 'react'

export function CommitActivityHeadline({ commit }: { commit: GitHubCommit }) {
    const body = useMemo(() => {
        return commit.commit.message.split('\n').slice(1).join('\n').trim()
    }, [commit.commit.message])

    return (
        <div className={'space-y-3'}>
            <h3 className={'font-headline text-center text-xl/5 font-bold'}>
                {commit.commit.message?.split('\n')[0]}
            </h3>
            <p className={'my-5 text-sm italic'}>Von {commit.author.login}</p>
            <div className={'text-sm whitespace-pre-line'}>
                <b>
                    {commit.commit.committer.date.toLocaleTimeString(
                        undefined,
                        {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour12: false,
                            hour: 'numeric',
                            minute: 'numeric',
                        }
                    )}{' '}
                    Uhr
                </b>
                {body.trim() !== '' && (
                    <>
                        , {body}
                        <br />
                        <br />
                    </>
                )}
            </div>
            <div className={'my-6 flex items-center space-x-2 text-sm'}>
                <div
                    className={`size-3`}
                    style={{ backgroundColor: '#' + getRandomHex(6) }}
                />
                <span className={''}>{commit.repository}</span>
            </div>
        </div>
    )
}
