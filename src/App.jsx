import { useEffect, useState } from "react"
import "./App.css"
import { getDataPokemon } from "./api/pokeapi"
import { Route, Routes } from "react-router"
import PokemonDetailPage from "./pages/PokemonDetailPage"
import PokemonGridPage from "./pages/PokemonGridPage"
import TopBar from "./components/TopBar"

const App = () => {
	const [pokemonList, setPokemonList] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [keyword, setKeyword] = useState("")

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

	const handleSearch = (value) => {
		setKeyword(value)
	}

	return (
		<>
			<TopBar onSearch={handleSearch} />

			<div className="app">
				{isLoading ? (
					<p className="status-message">Loading...</p>
				) : error ? (
					<p className="status-message status-error">{error.message}</p>
				) : (
					<Routes>
						<Route
							element={
								<PokemonGridPage pokemonList={pokemonList} keyword={keyword} />
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
		</>
	)
}

export default App
