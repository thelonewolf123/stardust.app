import Link from 'next/link'

export default function Home() {
    return (
        <div className="container mx-auto">
            <h1 className="mt-20 text-center text-3xl font-bold">
                Welcome to Star Dust
            </h1>
            <p className="mt-4 text-center text-lg">
                The ultimate cloud deployment platform for your business needs.
            </p>
            <div className="mt-8 flex justify-center">
                <Link href="/signup">
                    <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                        Get Started
                    </button>
                </Link>
            </div>
        </div>
    )
}
