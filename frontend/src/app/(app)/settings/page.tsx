import { getServerSession } from 'next-auth'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SettingsPage() {
    const session = await getServerSession()
    if (!session?.user) return null

    return (
        <div>
            <span>
                <Label>Name</Label>
                <Input value={session.user.name || ''} disabled />
            </span>
        </div>
    )
}
