import { useEffect, useState } from "react"

const useLocalStorage = (key, data) => {
	const [value, setValue] = useState(() => {
		const stored = localStorage.getItem(key)
		return stored ? JSON.parse(stored) : data
	})

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value))
	}, [key, value])

	return [value, setValue]
}

export default useLocalStorage
