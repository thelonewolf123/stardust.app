'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const authenticateAction = async (token: string) => {
    cookies().set('token', token, {
        maxAge: 60 * 60 * 60,
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    })

    revalidatePath('/login')
    return 'success'
}

export const logoutAction = async () => {
    cookies().set('token', '', {
        maxAge: 0,
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
    })

    revalidatePath('/')
    redirect('/login')
}

export const getAccessToken = async () => {
    const cookie = await cookies()
    const token = cookie.get('token')
    return token?.value
}
