import { Skeleton } from '@/components/ui/skeleton'

export default async function SingleProjectLoading() {
    return (
        <div className="container mt-4 space-y-2">
            <h1 className="text-3xl space-y-2 capitalize underline">
                <Skeleton className="w-1/2 h-10" />
            </h1>
            <div className="rounded shadow-md p-5 px-4 flex gap-4 w-full dark:bg-slate-900">
                <div className="w-1/3 prose dark:prose-invert">
                    <h3>
                        <Skeleton className="w-1/2 h-10" />
                    </h3>
                    <Skeleton className="w-full rounded-md h-52" />
                </div>
                <div className="w-full flex flex-col gap-4">
                    <Skeleton className="w-2/3 h-10" />
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-2/3 h-5" />
                    <div className="flex gap-2 items-baseline w-full">
                        <Skeleton className="w-2/3 h-5" />
                        <Skeleton className="w-1/4 h-5" />
                    </div>
                    <div className="flex gap-2 items-baseline w-full">
                        <Skeleton className="w-2/3 h-5" />
                        <Skeleton className="w-1/4 h-4" />
                    </div>
                    <div className="flex gap-2 items-baseline w-full">
                        <Skeleton className="w-2/3 h-5" />
                        <Skeleton className="w-1/4 h-4" />
                    </div>
                    <h4 className="flex gap-2 items-baseline w-full">
                        <Skeleton className="w-1/3 h-5" />
                        <Skeleton className="w-1/4 h-5" />
                    </h4>
                </div>
            </div>
        </div>
    )
}
