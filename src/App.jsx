import { useCallback, useEffect, useState } from "react"
import "./App.css"
import { getDataPokemon } from "./api/pokeapi"
import { Route, Routes, useSearchParams } from "react-router"
import PokemonDetailPage from "./pages/PokemonDetailPage"
import PokemonGridPage from "./pages/PokemonGridPage"
import TopBar from "./components/TopBar"

const App = () => {
	const [pokemonList, setPokemonList] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [searchParams, setSearchParams] = useSearchParams()

	const keyword = searchParams.get("search") ?? ""

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

	const handleSearch = useCallback(
		(value) => {
			setSearchParams((prev) => {
				const currentSearch = prev.get("search") ?? ""
				if (value === currentSearch) return prev

				const next = new URLSearchParams(prev)

				next.delete("page")

				if (value) {
					next.set("search", value)
				} else {
					next.delete("search")
				}

				return next
			})
		},
		[setSearchParams],
	)

	return (
		<>
			<TopBar onSearch={handleSearch} initialSearch={keyword} />

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
