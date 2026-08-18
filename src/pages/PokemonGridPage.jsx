import { useEffect, useState } from "react"
import PokemonList from "../components/PokemonList"
import { TypeFilter } from "../components/TypeFilter"
import { useFavoriteStore } from "../store/useFavoriteStore"

const PAGE_SIZE = 20

const PokemonGridPage = ({ pokemonList, keyword }) => {
	// --- state ---
	const favoritePokemonList = useFavoriteStore((state) => state.favorites)
	const removeFavoritePokemon = useFavoriteStore(
		(state) => state.removeFavorite,
	)
	const addFavoritePokemon = useFavoriteStore((state) => state.addFavorite)
	const [selectedTypes, setSelectedTypes] = useState([])
	const [currentPage, setCurrentPage] = useState(1)

	// --- derived value ---
	const filteredPokemon = pokemonList.filter((pokemon) => {
		const matchSearch = pokemon.name
			.toLowerCase()
			.trim()
			.includes(keyword.toLowerCase().trim())

		const matchType =
			selectedTypes.length === 0 ||
			pokemon.types.some((t) => selectedTypes.includes(t.type.name))

		return matchSearch && matchType
	})

	const totalPages = Math.ceil(filteredPokemon.length / PAGE_SIZE)

	const paginatedPokemon = filteredPokemon.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	)

	// --- handler ---
	const handleAddFavorite = (id) => {
		const pokemon = pokemonList.find((item) => item.id === id)
		addFavoritePokemon(pokemon)
	}

	const toggleType = (typeName) => {
		setSelectedTypes((prev) =>
			prev.includes(typeName)
				? prev.filter((t) => t !== typeName)
				: [...prev, typeName],
		)
	}

	const handleResetTypes = () => {
		setSelectedTypes([])
	}

	// --- effect ---
	useEffect(() => {
		setCurrentPage(1)
	}, [selectedTypes, keyword])

	return (
		<>
			<TypeFilter
				selectedTypes={selectedTypes}
				onToggleType={toggleType}
				onReset={handleResetTypes}
			/>

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
						data={paginatedPokemon}
						onAddFavorite={handleAddFavorite}
					/>

					<div className="pagination">
						<button
							className="btn"
							disabled={currentPage === 1}
							onClick={() => setCurrentPage((prev) => prev - 1)}
						>
							Previous
						</button>
						<p className="pagination-info">
							Page {currentPage} / {totalPages}
						</p>
						<button
							className="btn"
							disabled={currentPage === totalPages}
							onClick={() => setCurrentPage((prev) => prev + 1)}
						>
							Next
						</button>
					</div>
				</>
			)}
		</>
	)
}

export default PokemonGridPage
