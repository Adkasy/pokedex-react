import { useRef, useState } from "react"
import { capitalize } from "../utils/text"

const MAX_RESULTS = 40

const PokemonPicker = ({
	pokemonList,
	value,
	onChange,
	placeholder = "Pick a pokemon…",
}) => {
	const [query, setQuery] = useState("")
	const [isOpen, setIsOpen] = useState(false)
	const blurTimeout = useRef(null)

	const selected = pokemonList.find((p) => p.name === value)
	const displayValue = isOpen
		? query
		: selected
			? `#${String(selected.id).padStart(3, "0")} ${capitalize(selected.name)}`
			: ""

	const filtered = pokemonList
		.filter((p) => {
			const q = query.trim().toLowerCase()
			if (!q) return true
			return p.name.includes(q) || String(p.id).includes(q)
		})
		.slice(0, MAX_RESULTS)

	const handleFocus = () => {
		clearTimeout(blurTimeout.current)
		setQuery("")
		setIsOpen(true)
	}

	const handleBlur = () => {
		// delay dikit biar onClick di menu sempet kejalanin duluan
		// sebelum menu-nya ke-unmount gara-gara blur
		blurTimeout.current = setTimeout(() => {
			setIsOpen(false)
			setQuery("")
		}, 150)
	}

	const handleSelect = (name) => {
		onChange(name)
		setIsOpen(false)
		setQuery("")
	}

	return (
		<div className="pokemon-picker">
			<input
				className="pokemon-picker-input"
				type="text"
				value={displayValue}
				placeholder={placeholder}
				onChange={(e) => setQuery(e.target.value)}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>

			{isOpen && (
				<ul className="pokemon-picker-menu">
					{filtered.length === 0 ? (
						<li className="pokemon-picker-empty">No match</li>
					) : (
						filtered.map((p) => (
							<li key={p.name}>
								<button
									type="button"
									className={`pokemon-picker-option${
										p.name === value ? " is-selected" : ""
									}`}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelect(p.name)}
								>
									<img src={p.image} alt="" />
									<span className="pokemon-picker-option-id">
										#{String(p.id).padStart(3, "0")}
									</span>
									<span className="pokemon-picker-option-name">
										{capitalize(p.name)}
									</span>
								</button>
							</li>
						))
					)}
				</ul>
			)}
		</div>
	)
}

export default PokemonPicker
