import React, { useState } from "react"
import PokemonList from "../components/PokemonList"
import useDebounce from "../hooks/useDebounce"

const PokemonGridPage = ({
	pokemonList,
	favoritePokemonList,
	onAddFavorite,
}) => {
	const [searchTerm, setSearchTerm] = useState("")
	const debouncedSearch = useDebounce(searchTerm, 300)

	const filteredPokemon = pokemonList.filter((pokemon) =>
		pokemon.name
			.toLowerCase()
			.trim()
			.includes(debouncedSearch.toLowerCase().trim()),
	)

	return (
		<>
			<div className="search-bar">
				<input
					className="search-input"
					type="text"
					placeholder="Cari Pokemon"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
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

					<PokemonList data={filteredPokemon} onAddFavorite={onAddFavorite} />
				</>
			)}
		</>
	)
}

export default PokemonGridPage
