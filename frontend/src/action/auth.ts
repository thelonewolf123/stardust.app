'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const authenticateAction = async (token: string) => {
    cookies().set('x-access-token', token, {
        maxAge: 60 * 60 * 60,
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    })

    revalidatePath('/login')
    return 'success'
}

export const logoutAction = async () => {
    cookies().set('x-access-token', '', {
        maxAge: 0,
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    })

    revalidatePath('/')
    return 'success'
}

export const getAccessToken = async () => {
    const cookie = await cookies()
    const token = cookie.get('x-access-token')
    return token?.value
}
