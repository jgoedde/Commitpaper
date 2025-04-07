import { PrActivityHeadline } from './PrActivityHeadline.tsx'
import { CommitActivityHeadline } from './CommitActivityHeadline.tsx'
import { GitHubActivity } from '../use-repository-activities.ts'

export function ActivityHeadline({ activity }: { activity: GitHubActivity }) {
    if (activity.type === 'commit') {
        return <CommitActivityHeadline commit={activity} />
    } else {
        return <PrActivityHeadline pr={activity} />
    }
}
