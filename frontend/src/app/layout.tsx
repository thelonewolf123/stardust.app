import type { Metadata } from 'next'
import './globals.css'

import { Inter } from 'next/font/google'

import Navbar from '@/components/internal/navbar'
import { ApolloWrapper } from '@/components/internal/wrapper/apollo'
import { ThemeProvider } from '@/components/internal/wrapper/theme'

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
            <body className={inter.className}>
                <ApolloWrapper>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                    </ThemeProvider>
                </ApolloWrapper>
            </body>
        </html>
    )
}
