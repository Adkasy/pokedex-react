import { Link } from "react-router"
import { PokeballIcon, StarIcon } from "./TypeIcon"
import SearchBar from "./SearchBar"

const TopBar = ({ onSearch }) => {
	return (
		<header className="top-bar">
			<Link to="/" className="top-bar-brand">
				<span className="top-bar-logo">
					<PokeballIcon size={26} />
				</span>
				Pokédex
			</Link>

			<SearchBar onSearch={onSearch} />

			<nav className="top-bar-nav">
				<Link to="/favorites" className="top-bar-link">
					<StarIcon size={16} />
					<span className="top-bar-link-text">Favorites</span>
				</Link>
			</nav>
		</header>
	)
}

export default TopBar
