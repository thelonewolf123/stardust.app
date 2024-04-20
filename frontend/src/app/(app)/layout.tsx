import Navbar from '@/components/internal/common/navbar'

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}
