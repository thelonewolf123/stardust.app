import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

import { addGithubToken } from '@/lib/server-utils'

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            authorization: {
                params: {
                    scope: 'read:user user:email repo admin:repo_hook'
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account, user, profile }) {
            if (!account || !profile) return token

            const accessToken = account.access_token as string
            let username = ''
            if (profile && 'login' in profile) {
                username = profile.login as string
            }

            if (accessToken && username) {
                await addGithubToken(accessToken, username)
                console.log('Added github token')
            }
            return token
        }
    }
})

export { handler as GET, handler as POST }
