import { useState } from "react"
import PokemonList from "../components/PokemonList"
import useDebounce from "../hooks/useDebounce"
import { useFavoriteStore } from "../store/useFavoriteStore"
import { SearchIcon, CloseIcon } from "../components/TypeIcon"

const PokemonGridPage = ({ pokemonList, onLoadMore }) => {
	const [searchTerm, setSearchTerm] = useState("")
	const debouncedSearch = useDebounce(searchTerm, 300)
	const favoritePokemonList = useFavoriteStore((state) => state.favorites)
	const onaddFavorite = useFavoriteStore((state) => state.addFavorite)

	const handleAddFavorite = (id) => {
		const pokemon = pokemonList.find((item) => item.id === id)
		onaddFavorite(pokemon)
	}

	const filteredPokemon = pokemonList.filter((pokemon) =>
		pokemon.name
			.toLowerCase()
			.trim()
			.includes(debouncedSearch.toLowerCase().trim()),
	)

	return (
		<>
			<div className="search-bar">
				<div className="search-input-wrapper">
					<span className="search-input-icon">
						<SearchIcon size={18} />
					</span>
					<input
						className="search-input"
						type="text"
						placeholder="Cari Pokemon"
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

			{filteredPokemon.length === 0 ? (
				<p className="status-message">Pokemon not found</p>
			) : (
				<>
					<div className="favorites-section">
						<p className="favorites-title">Favorites Pokemon by You</p>
						{favoritePokemonList.length === 0 ? (
							<p className="favorites-empty">Belum ada favorit.</p>
						) : (
							<ul className="favorites-list">
								{favoritePokemonList.map((pokemon) => (
									<li key={pokemon.id} className="favorites-list-item">
										{pokemon.name}
									</li>
								))}
							</ul>
						)}
					</div>

					<PokemonList
						data={filteredPokemon}
						onAddFavorite={handleAddFavorite}
					/>

					<div className="load-more-wrapper">
						<button className="btn btn-load-more" onClick={onLoadMore}>
							Load More...
						</button>
					</div>
				</>
			)}
		</>
	)
}

export default PokemonGridPage
