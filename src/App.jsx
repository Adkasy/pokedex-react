import { useCallback, useEffect, useState } from "react"
import "./App.css"
import { getDataPokemon } from "./api/pokeapi"
import { Route, Routes, useSearchParams } from "react-router"
import PokemonDetailPage from "./pages/PokemonDetailPage"
import PokemonGridPage from "./pages/PokemonGridPage"
import NotFoundPage from "./pages/NotFoundPage"
import TopBar from "./components/TopBar"
import SkeletonCard from "./components/SkeletonCard"

const SKELETON_COUNT = 8

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
					<ul className="pokemon-grid">
						{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
							<SkeletonCard key={i} />
						))}
					</ul>
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
						<Route element={<NotFoundPage />} path="*" />
					</Routes>
				)}
			</div>
		</>
	)
}

export default App
