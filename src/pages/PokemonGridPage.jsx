import PokemonList from "../components/PokemonList"
import { useFavoriteStore } from "../store/useFavoriteStore"

const PokemonGridPage = ({ pokemonList, keyword }) => {
	const favoritePokemonList = useFavoriteStore((state) => state.favorites)
	const removeFavoritePokemon = useFavoriteStore(
		(state) => state.removeFavorite,
	)
	const addFavoritePokemon = useFavoriteStore((state) => state.addFavorite)

	const handleAddFavorite = (id) => {
		const pokemon = pokemonList.find((item) => item.id === id)
		addFavoritePokemon(pokemon)
	}

	const filteredPokemon = pokemonList.filter((pokemon) =>
		pokemon.name.toLowerCase().trim().includes(keyword.toLowerCase().trim()),
	)

	return (
		<>
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
										<button
											className="remove-favorite"
											onClick={() => removeFavoritePokemon(pokemon.id)}
										>
											x
										</button>
									</li>
								))}
							</ul>
						)}
					</div>

					<PokemonList
						data={filteredPokemon}
						onAddFavorite={handleAddFavorite}
					/>
				</>
			)}
		</>
	)
}

export default PokemonGridPage
