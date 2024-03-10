import { FaCheckCircle } from 'react-icons/fa'
import { IoCloseCircle } from 'react-icons/io5'
import { MdPending } from 'react-icons/md'

import { ContainerStatus } from '@/graphql-client'

import { Badge } from '../ui/badge'

export const StatusIcon: React.FC<{ status?: ContainerStatus }> = ({
    status
}) => {
    let icon = null
    switch (status) {
        case 'running':
            icon = <FaCheckCircle className="text-green-500" />
            break
        case 'pending':
            icon = <MdPending className="text-yellow-500" />
            break
        case 'failed':
            icon = <IoCloseCircle className="text-red-500" />
    }

    return (
        <Badge className="flex w-fit gap-4 capitalize h-fit">
            <span>{status}</span>
            {icon}
        </Badge>
    )
}
