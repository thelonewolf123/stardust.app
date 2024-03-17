'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

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
    return 'success'
}
