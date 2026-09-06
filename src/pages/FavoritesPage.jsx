import PokemonList from "../components/PokemonList"
import { useFavoriteStore } from "../store/useFavoriteStore"

const noop = () => {}

const FavoritesPage = () => {
	const favorites = useFavoriteStore((state) => state.favorites)

	return (
		<>
			<h1 className="page-title">Favorites</h1>

			{favorites.length === 0 ? (
				<p className="status-message">Belum ada pokemon favorit.</p>
			) : (
				<PokemonList data={favorites} onAddFavorite={noop} />
			)}
		</>
	)
}

export default FavoritesPage
