import { useEffect, useState } from "react"

const useDebounce = (valueInput, delay = 300) => {
	const [debounced, setDebounced] = useState(valueInput)

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(valueInput), delay)

		return () => clearTimeout(timer)
	}, [valueInput, delay])

	return debounced
}

export default useDebounce
