import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    const list = new Array(7).fill(null).map((_, i) => i)
    return (
        <div className="container mt-4 space-y-2">
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-xl">Here are all the projects</p>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {list.map((id) => (
                    <li
                        className="rounded-xl p-5 shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:cursor-pointer dark:bg-slate-900"
                        key={id}
                    >
                        <div className="space-y-2 border-none shadow-none outline-none">
                            <h3 className="w-full truncate text-nowrap pb-1 text-xl">
                                <Skeleton className="h-5 w-3/4" />
                            </h3>
                            <p className="text-muted-foreground mb-2 flex flex-col gap-1">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </p>
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
