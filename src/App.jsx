import { useEffect, useState } from "react"
import "./App.css"
import PokemonList from "./components/PokemonList"
import { getDataPokemon } from "./api/pokeapi"
import useDebounce from "./hooks/useDebounce"
import useLocalStorage from "./hooks/useLocalStorage"
import { getTypeColor } from "./constants/typeColors"
import { Route, Routes } from "react-router"
import PokemonDetailPage from "./pages/PokemonDetailPage"
import PokemonGridPage from "./pages/PokemonGridPage"

const App = () => {
	const [pokemonList, setPokemonList] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedPokemon, setSelectedPokemon] = useState(null)
	const [favoritePokemonList, setFavoritePokemonList] = useLocalStorage(
		"Favorites Pokemon",
		[],
	)

	useEffect(() => {
		const fetchPokemon = async () => {
			try {
				setIsLoading(true)

				const data = await getDataPokemon()
				setPokemonList(data)
			} catch (fetchError) {
				setError(fetchError)
			} finally {
				setIsLoading(false)
			}
		}

		fetchPokemon()
	}, [])

	const debouncedSearch = useDebounce(searchTerm, 300)

	const filteredPokemon = pokemonList.filter((pokemon) =>
		pokemon.name
			.toLowerCase()
			.trim()
			.includes(debouncedSearch.toLowerCase().trim()),
	)

	const handleSelectPokemon = (id) => {
		const pokemon = filteredPokemon.find((item) => item.id === id)
		setSelectedPokemon(pokemon)
	}

	const handleAddFavorite = (id) => {
		const isAlreadyFavorite = favoritePokemonList.some(
			(favorite) => favorite.id === id,
		)
		if (isAlreadyFavorite) return

		const pokemon = filteredPokemon.find((item) => item.id === id)
		setFavoritePokemonList((prev) => [...prev, pokemon])
	}

	return (
		<div className="app">
			<div className="search-bar">
				<input
					className="search-input"
					type="text"
					placeholder="Cari Pokemon"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{isLoading ? (
				<p className="status-message">Loading...</p>
			) : error ? (
				<p className="status-message status-error">{error.message}</p>
			) : selectedPokemon ? (
				<div className="detail-panel">
					<img
						className="detail-image"
						src={
							selectedPokemon.sprites.other["official-artwork"].front_default
						}
						alt={selectedPokemon.name}
					/>
					<p className="detail-name">{selectedPokemon.name}</p>

					<div className="type-badge-row">
						{selectedPokemon.types.map(({ type }) => (
							<span
								key={type.name}
								className="type-badge"
								style={{ backgroundColor: getTypeColor(type.name) }}
							>
								{type.name}
							</span>
						))}
					</div>

					<p className="detail-stat">Height: {selectedPokemon.height / 10} m</p>
					<p className="detail-stat">
						Weight: {selectedPokemon.weight / 10} kg
					</p>

					<div className="detail-actions">
						<button className="btn" onClick={() => setSelectedPokemon(null)}>
							Back to Grid
						</button>
						<button
							className="btn btn-primary"
							onClick={() => handleAddFavorite(selectedPokemon.id)}
						>
							Add to Favorites
						</button>
					</div>
				</div>
			) : filteredPokemon.length === 0 ? (
				<p className="status-message">Tidak Ada Pokemon yang Ditemukan</p>
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
						onSelectPokemon={handleSelectPokemon}
						onAddFavorite={handleAddFavorite}
					/>
				</>
			)}

			<Routes>
				<Route element={<PokemonGridPage />} path="/" />
				<Route element={<PokemonDetailPage />} path="/pokemon/:name" />
			</Routes>
		</div>
	)
}

export default App
