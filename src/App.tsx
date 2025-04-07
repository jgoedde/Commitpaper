import { format } from 'date-fns'
import { useRepositoryActivities } from './use-repository-activities.ts'
import { ActivityHeadline } from './headlines/ActivityHeadline.tsx'

const user = import.meta.env.VITE_GITHUB_USER

function App() {
    const { activities, isLoading } = useRepositoryActivities(user)

    return (
        <div className={'container mx-auto max-w-6xl px-3'}>
            <div className={'py-3'}>
                <h1 className="font-headline text-center text-4xl font-black tracking-wide uppercase">
                    GitHubsche
                </h1>
                <h1 className="font-headline text-center text-6xl font-black tracking-wide uppercase">
                    Neueste Nachrichten
                </h1>
                <div className={'mt-4'}>
                    <hr />
                    <div className={'my-2 flex justify-between'}>
                        <span>Aktivität von @{user}</span>
                        <span className={'self-end'}>
                            {format(new Date(), 'dd.MM.yyyy')}
                        </span>
                    </div>
                    <hr />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:grid-rows-[auto_auto_auto_auto_auto]">
                <div className="row-span-5 flex flex-col space-y-8">
                    {activities[1] != null && (
                        <ActivityHeadline activity={activities[1]} />
                    )}
                    {activities[2] != null && (
                        <ActivityHeadline activity={activities[2]} />
                    )}
                </div>
                <div className="col-span-3 row-span-2 h-80">
                    <img
                        src={'/pie-chart-mock.png'}
                        className="mx-auto max-h-full object-contain grayscale"
                    />
                </div>
                <div className="col-start-5 row-span-5">
                    {activities[3] != null && (
                        <ActivityHeadline activity={activities[3]} />
                    )}
                </div>
                <div className="col-span-3 col-start-2 row-start-3">
                    {isLoading && (
                        <div className={'text-center'}>
                            Crunching the numbers...
                        </div>
                    )}
                    {activities[0] != null && (
                        <ActivityHeadline activity={activities[0]} />
                    )}
                </div>
            </div>

            {/*<p className="font-ui">UI font</p>*/}
            {/*<p className="font-oldpress">oldpress</p>*/}
            {/*<p>Normal text (body)</p>*/}
        </div>
    )
}

export default App
