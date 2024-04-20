import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    const history = new Array(3).fill(0).map((_, i) => i)

    return (
        <div className="container">
            <div className="flex justify-between my-8">
                <Skeleton className="w-1/2 h-10" />
            </div>
            <div className="flex flex-col gap-4">
                {history.map((_, idx) => {
                    return (
                        <div
                            key={idx}
                            className="border flex justify-between rounded p-4"
                        >
                            <div className="flex gap-4">
                                <Skeleton className="w-20 h-8" />
                                <Skeleton className="w-36 h-8" />
                            </div>
                            <Skeleton className="w-36 h-8" />
                            <Skeleton className="w-20 h-8" />
                            <Skeleton className="w-20 h-8" />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
