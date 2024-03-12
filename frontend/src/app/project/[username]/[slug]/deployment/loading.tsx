import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="container">
            <h1 className="text-3xl font-semibold space-y-2 capitalize my-4">
                <Skeleton className="w-1/2 h-10" />
            </h1>
            <div className="flex flex-col gap-4">
                <Skeleton className="w-full h-16 rounded" />
                <Skeleton className="w-full h-16 rounded" />
                <Skeleton className="w-full h-16 rounded" />
                <Skeleton className="w-full h-16 rounded" />
                <Skeleton className="w-full h-16 rounded" />
                <Skeleton className="w-full h-16 rounded" />
            </div>
        </div>
    )
}
