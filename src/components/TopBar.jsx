import { Link } from "react-router"
import { PokeballIcon, StarIcon, CompareIcon } from "./TypeIcon"
import SearchBar from "./SearchBar"

const TopBar = ({ onSearch, initialSearch }) => {
	return (
		<header className="top-bar">
			<Link to="/" className="top-bar-brand">
				<span className="top-bar-logo">
					<PokeballIcon size={26} />
				</span>
				Pokédex
			</Link>

			<SearchBar onSearch={onSearch} initialSearch={initialSearch} />

			<nav className="top-bar-nav">
				<Link to="/compare" className="top-bar-link">
					<CompareIcon size={16} />
					<span className="top-bar-link-text">Compare</span>
				</Link>
				<Link to="/favorites" className="top-bar-link">
					<StarIcon size={16} />
					<span className="top-bar-link-text">Favorites</span>
				</Link>
			</nav>
		</header>
	)
}

export default TopBar
