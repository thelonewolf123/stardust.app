import { FaArrowCircleUp } from 'react-icons/fa'

import { Badge } from '../../ui/badge'

export function CurrentBadge() {
    return (
        <Badge className="flex w-fit gap-2 capitalize h-fit bg-blue-200 px-1 text-blue-600 text-xs">
            <FaArrowCircleUp size={14} />
            <span>Current</span>
        </Badge>
    )
}
