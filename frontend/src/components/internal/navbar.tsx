import { Button } from '../ui/button'

export default function Navbar() {
    return (
        <nav className="flex justify-between bg-white p-2 shadow">
            <a href="/">
                <h1 className="px-2 text-2xl">
                    <span className="text-2xl">✨</span> Stardust
                </h1>
            </a>
            <span className="flex items-baseline gap-2">
                <a href="/login" className="hover:underline">
                    Login
                </a>
                <a href="/signup">
                    <Button>Sign up</Button>
                </a>
            </span>
        </nav>
    )
}
