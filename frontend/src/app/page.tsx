export default function Home() {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center mt-20">
                Welcome to Star Dust
            </h1>
            <p className="text-lg text-center mt-4">
                The ultimate cloud deployment platform for your business needs.
            </p>
            <div className="flex justify-center mt-8">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Get Started
                </button>
            </div>
        </div>
    )
}
