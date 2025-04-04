import { GitHubActivity } from './use-top-repos.ts'
import { PrActivityHeadline } from './PrActivityHeadline.tsx'
import { CommitActivityHeadline } from './CommitActivityHeadline.tsx'

export function ActivityHeadline({ activity }: { activity: GitHubActivity }) {
    if (activity.type === 'commit') {
        return <CommitActivityHeadline commit={activity} />
    } else {
        return <PrActivityHeadline pr={activity} />
    }
}
