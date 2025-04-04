import { format } from 'date-fns'

const user = import.meta.env.VITE_GITHUB_USER

function App() {
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
                        <span className={''}>Aktivität von @{user}</span>
                        <span className={'self-end'}>
                            {format(new Date(), 'dd.MM.yyyy')}
                        </span>
                    </div>
                    <hr />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-5 grid-rows-5 gap-4">
                <div className="col-span-3 row-span-3">
                    <img width={'100%'} src={'https://placecats.com/300/200'} />
                </div>
                <div className="col-span-2 col-start-4 row-span-5">
                    <div className={'space-y-3'}>
                        <h3
                            className={
                                'font-headline text-center text-xl/5 font-bold'
                            }
                        >
                            fix: update .NET markdown code
                        </h3>
                        <p className={'text-sm'}>
                            Removed one square bracket, there was one too many.
                        </p>
                    </div>
                    <div
                        className={
                            'mt-3 flex items-center justify-end space-x-2 text-sm'
                        }
                    >
                        <div className={'size-3 bg-teal-500'} />
                        <span className={''}>md-badges</span>
                    </div>
                </div>
                <div className="col-span-3 row-span-2 row-start-4">
                    <div className={'space-y-3'}>
                        <h3
                            className={
                                'font-headline text-center text-xl/5 font-bold'
                            }
                        >
                            Remove calendar iOS test stage
                        </h3>
                        <p className={'text-sm'}>Closes #8581</p>
                    </div>
                    <div
                        className={
                            'mt-3 flex items-center justify-end space-x-2 text-sm'
                        }
                    >
                        <div className={'size-3 bg-red-500'} />
                        <span className={''}>tutanota</span>
                    </div>
                </div>
            </div>

            {/*<p className="font-ui">UI font</p>*/}
            {/*<p className="font-oldpress">oldpress</p>*/}
            {/*<p>Normal text (body)</p>*/}
        </div>
    )
}

export default App
