import type { Metadata } from 'next'
import './globals.css'

import { Inter } from 'next/font/google'

import { ApolloWrapper } from '@/components/internal/wrapper/apollo'
import { NextAuthProvider } from '@/components/internal/wrapper/session'
import { ThemeProvider } from '@/components/internal/wrapper/theme'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Star Dust - Cloud Deployment Platform',
    description: 'Star Dust is a cloud deployment platform for developers.'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body className={inter.className}>
                <NextAuthProvider>
                    <ApolloWrapper>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <Toaster />
                            {children}
                        </ThemeProvider>
                    </ApolloWrapper>
                </NextAuthProvider>
            </body>
        </html>
    )
}
