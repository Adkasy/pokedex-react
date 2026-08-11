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

	const handleAddFavorite = (id) => {
		const isAlreadyFavorite = favoritePokemonList.some(
			(favorite) => favorite.id === id,
		)
		if (isAlreadyFavorite) return

		const pokemon = pokemonList.find((item) => item.id === id)
		setFavoritePokemonList((prev) => [...prev, pokemon])
	}

	return (
		<div className="app">
			{isLoading ? (
				<p className="status-message">Loading...</p>
			) : error ? (
				<p className="status-message status-error">{error.message}</p>
			) : (
				<Routes>
					<Route
						element={
							<PokemonGridPage
								pokemonList={pokemonList}
								favoritePokemonList={favoritePokemonList}
								onAddFavorite={handleAddFavorite}
							/>
						}
						path="/"
					/>
					<Route
						element={
							<PokemonDetailPage
								pokemonList={pokemonList}
								onAddFavorite={handleAddFavorite}
							/>
						}
						path="/pokemon/:name"
					/>
				</Routes>
			)}
		</div>
	)
}

export default App
