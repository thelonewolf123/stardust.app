'use client'

import Link from 'next/link'

export default function ErrorPage() {
    return (
        <>
            <div className="my-8 flex justify-center font-bold">
                <h1 className="text-3xl capitalize">
                    <span> 😔 </span>
                    <span> Something went wrong </span>
                </h1>
            </div>
            <div className="my-8 flex justify-center">
                <p>
                    Please contact the{' '}
                    <Link
                        href="https://github.com/thelonewolf123/stardust.app"
                        className="underline"
                        target="_blank"
                    >
                        maintainer
                    </Link>{' '}
                    to address the issue
                </p>
            </div>
        </>
    )
}
