export default function Navbar() {
    return (
        <nav className="bg-white shadow flex justify-between p-2">
            <a href="/">
                <h1 className="text-2xl">Jet-Deploy</h1>
            </a>
            <span className="flex gap-2 items-baseline">
                <a href="/login" className="hover:underline">
                    Login
                </a>
                <a
                    href="/signup"
                    className="bg-pink-500 text-white p-1 px-2 rounded-sm hover:bg-pink-600 hover:outline-1"
                >
                    Sign up
                </a>
            </span>
        </nav>
    )
}
