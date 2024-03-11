import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'

export default function LoaderUi() {
    return (
        <CardContent className="p-2 flex h-80 justify-center items-center">
            <Button className="btn btn-primary" loading={true}>
                Loading...
            </Button>
        </CardContent>
    )
}
