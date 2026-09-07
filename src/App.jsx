import { useCallback, useEffect } from "react"
import "./App.css"
import { Route, Routes, useLocation, useSearchParams } from "react-router"
import PokemonDetailPage from "./pages/PokemonDetailPage"
import PokemonGridPage from "./pages/PokemonGridPage"
import FavoritesPage from "./pages/FavoritesPage"
import ComparePage from "./pages/ComparePage"
import NotFoundPage from "./pages/NotFoundPage"
import TopBar from "./components/TopBar"
import LoadingSpinner from "./components/LoadingSpinner"
import { usePokemonStore } from "./store/usePokemonStore"

const App = () => {
	const index = usePokemonStore((state) => state.index)
	const isLoading = usePokemonStore((state) => state.isIndexLoading)
	const error = usePokemonStore((state) => state.indexError)
	const loadIndex = usePokemonStore((state) => state.loadIndex)
	const [searchParams, setSearchParams] = useSearchParams()
	const { pathname } = useLocation()

	const keyword = searchParams.get("search") ?? ""

	// cuma ngambil index RINGAN (nama + id + gambar) semua Pokemon di
	// sini — detail lengkapnya di-fetch belakangan per halaman, liat
	// usePokemonStore
	useEffect(() => {
		loadIndex()
	}, [loadIndex])

	// react-router gak reset scroll otomatis pas pindah halaman (beda
	// route, misal grid -> detail) — tanpa ini, scroll position lama
	// kebawa, jadi kadang landing di tengah halaman baru (kebetulan
	// ketemu section apa aja yang ada di offset itu) alih-alih di atas.
	// Cuma depend ke pathname (bukan search params), biar gak bentrok
	// sama scroll-per-page pagination di grid.
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [pathname])

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
					<LoadingSpinner label="Loading the Pokédex…" size={64} />
				) : error ? (
					<p className="status-message status-error">{error.message}</p>
				) : (
					<Routes>
						<Route
							element={<PokemonGridPage index={index} keyword={keyword} />}
							path="/"
						/>
						<Route
							element={<PokemonDetailPage index={index} />}
							path="/pokemon/:name"
						/>
						<Route element={<FavoritesPage />} path="/favorites" />
						<Route
							element={<ComparePage index={index} />}
							path="/compare"
						/>
						<Route element={<NotFoundPage />} path="*" />
					</Routes>
				)}
			</div>
		</>
	)
}

export default App
