import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default async function SingleProjectLoading() {
    return (
        <div className="container mt-4 space-y-2">
            <div className="flex justify-between my-8">
                <Skeleton className="w-1/2 h-10" />
                <div className="flex gap-2">
                    <Skeleton className="w-20 h-10" />
                    <Skeleton className="w-20 h-10" />
                    <Skeleton className="w-20 h-10" />
                </div>
            </div>
            <div className="rounded shadow-md p-5 px-4 flex gap-4 w-full dark:bg-slate-900">
                <div className="w-1/2 prose dark:prose-invert">
                    <h3>
                        <Skeleton className="w-1/2 h-10" />
                    </h3>
                    <Skeleton className="w-full rounded-md h-72" />
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
            <div className="py-4">
                <h3 className="mb-2">
                    <Skeleton className="w-1/2 h-10" />
                </h3>
                <Card className="h-full">
                    <div className="flex items-baseline justify-between p-4">
                        <div className="flex prose dark:prose-invert gap-4 pb-2">
                            <h4>
                                <Skeleton className="w-52 h-8" />
                            </h4>
                            <h4>
                                <Skeleton className="w-52 h-8" />
                            </h4>
                            <h4>
                                <Skeleton className="w-52 h-8" />
                            </h4>
                        </div>
                        <Skeleton className="w-[180px] h-8" />
                    </div>

                    <Separator className="w-full" />

                    <Skeleton className="w-full h-96" />
                </Card>
            </div>
        </div>
    )
}
