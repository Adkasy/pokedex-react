import { useEffect, useState } from "react"
import "./App.css"
import { getDataPokemon } from "./api/pokeapi"
import { Route, Routes } from "react-router"
import PokemonDetailPage from "./pages/PokemonDetailPage"
import PokemonGridPage from "./pages/PokemonGridPage"

const App = () => {
	const [pokemonList, setPokemonList] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

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

	const handleLoadMoreData = async () => {
		const morePokemonData = await getDataPokemon(10, pokemonList.length)
		setPokemonList((prev) => [...prev, ...morePokemonData])
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
								onLoadMore={handleLoadMoreData}
							/>
						}
						path="/"
					/>
					<Route
						element={<PokemonDetailPage pokemonList={pokemonList} />}
						path="/pokemon/:name"
					/>
				</Routes>
			)}
		</div>
	)
}

export default App
