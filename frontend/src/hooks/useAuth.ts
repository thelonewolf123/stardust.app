import { useEffect, useState } from 'react'

export function useAuth() {
    const [isLogged, setIsLogged] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            setIsLogged(true)
        }
    }, [])

    return { isLogged }
}
