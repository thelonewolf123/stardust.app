import passport from 'passport'
import { Strategy as GithubStrategy } from 'passport-github2'

import { env } from '@/env'

type User = {
    username: string
    id: string
}

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj: User, done) => {
    done(null, {
        username: obj.username,
        id: obj.id
    })
})

passport.use(
    new GithubStrategy(
        {
            clientID: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            callbackURL: '/auth/github/callback',
            scope: ['user:email', 'read:user', 'repo', 'admin:repo_hook']
        },
        (accessToken, refreshToken, results, profile, verified) => {
            const user = {
                username: profile.username,
                id: profile.id
            }
            return verified(null, user)
        }
    )
)

export default passport
