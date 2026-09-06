import { useEffect, useState } from "react"
import { CloseIcon, SearchIcon } from "./TypeIcon"
import useDebounce from "../hooks/useDebounce"

const SearchBar = ({ onSearch, initialSearch }) => {
	const [searchTerm, setSearchTerm] = useState(() => initialSearch ?? "")
	const debouncedSearch = useDebounce(searchTerm, 300)

	useEffect(() => {
		onSearch(debouncedSearch)
	}, [debouncedSearch, onSearch])

	return (
		<div className="search-bar">
			<div className="search-input-wrapper">
				<span className="search-input-icon">
					<SearchIcon size={18} />
				</span>
				<input
					className="search-input"
					type="text"
					placeholder="Search Pokemon"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{searchTerm && (
					<button
						className="search-clear-btn"
						onClick={() => setSearchTerm("")}
						aria-label="Clear search"
					>
						<CloseIcon size={12} />
					</button>
				)}
			</div>
		</div>
	)
}

export default SearchBar
