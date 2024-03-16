import { Skeleton } from '@/components/ui/skeleton'

export default function NewPageLoading() {
    return (
        <div className="w-full space-y-4">
            <h1 className="text-xl font-medium underline">
                <Skeleton className="w-1/2 h-10" />
            </h1>
            <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
            </div>
            <Skeleton className="w-1/4 h-10" />
            <div className="grid grid-cols-2 gap-2">
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-8" />
            </div>
            <Skeleton className="w-1/4 h-10" />
        </div>
    )
}
