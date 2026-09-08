import { useEffect, useRef, useState } from "react"
import { MdKeyboardArrowDown } from "react-icons/md"
import { capitalize } from "../utils/text"
import PokemonImage from "./PokemonImage"

const PokemonPicker = ({
	pokemonList,
	value,
	onChange,
	placeholder = "Pick a pokemon…",
}) => {
	const [query, setQuery] = useState("")
	const [isOpen, setIsOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const blurTimeout = useRef(null)
	const optionRefs = useRef([])
	const inputRef = useRef(null)

	const selected = pokemonList.find((p) => p.name === value)
	const displayValue = isOpen
		? query
		: selected
			? `#${String(selected.id).padStart(3, "0")} ${capitalize(selected.name)}`
			: ""

	const filtered = pokemonList.filter((p) => {
		const q = query.trim().toLowerCase()
		if (!q) return true
		return p.name.includes(q) || String(p.id).includes(q)
	})

	useEffect(() => {
		optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
	}, [activeIndex])

	// kalau component-nya unmount pas timer blur (di bawah) masih jalan,
	// timernya harus dibatalin juga — biar gak coba setState ke component
	// yang udah gak ada
	useEffect(() => {
		return () => clearTimeout(blurTimeout.current)
	}, [])

	const openMenu = () => {
		clearTimeout(blurTimeout.current)
		setQuery("")
		setIsOpen(true)
		setActiveIndex(-1)
	}

	const closeMenu = () => {
		setIsOpen(false)
		setQuery("")
		setActiveIndex(-1)
	}

	const handleBlur = () => {
		// delay dikit biar onClick di menu sempet kejalanin duluan
		// sebelum menu-nya ke-unmount gara-gara blur
		blurTimeout.current = setTimeout(closeMenu, 150)
	}

	const handleSelect = (name) => {
		onChange(name)
		closeMenu()
		// abis milih, lepas fokus dari input — biar gak "nyangkut" nunggu
		// user klik ke tempat lain dulu sebelum bisa buka picker lain
		inputRef.current?.blur()
	}

	const handleChange = (e) => {
		setQuery(e.target.value)
		setIsOpen(true)
		setActiveIndex(-1)
	}

	const handleKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault()
			if (!isOpen) {
				openMenu()
				return
			}
			setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			setActiveIndex((prev) => Math.max(prev - 1, 0))
		} else if (e.key === "Enter") {
			e.preventDefault()
			if (isOpen && filtered[activeIndex]) {
				handleSelect(filtered[activeIndex].name)
			}
		} else if (e.key === "Escape") {
			e.target.blur()
			closeMenu()
		}
	}

	return (
		<div className="pokemon-picker">
			<input
				ref={inputRef}
				className="pokemon-picker-input"
				type="text"
				value={displayValue}
				placeholder={placeholder}
				onChange={handleChange}
				onFocus={openMenu}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				role="combobox"
				aria-expanded={isOpen}
				aria-autocomplete="list"
			/>
			<MdKeyboardArrowDown className="pokemon-picker-chevron" size={20} />

			{isOpen && (
				<ul className="pokemon-picker-menu">
					{filtered.length === 0 ? (
						<li className="pokemon-picker-empty">No match</li>
					) : (
						filtered.map((p, i) => (
							<li key={p.name}>
								<button
									ref={(el) => (optionRefs.current[i] = el)}
									type="button"
									className={`pokemon-picker-option${
										p.name === value ? " is-selected" : ""
									}${i === activeIndex ? " is-active" : ""}`}
									onMouseDown={(e) => e.preventDefault()}
									onMouseEnter={() => setActiveIndex(i)}
									onClick={() => handleSelect(p.name)}
								>
									<PokemonImage
										className="pokemon-picker-option-image"
										src={p.image}
										iconSize={24}
									/>
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
