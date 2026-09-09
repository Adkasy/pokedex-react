import PokemonList from "../components/PokemonList"
import { useFavoriteStore } from "../store/useFavoriteStore"

// PokemonList WAJIB dikasih `onAddFavorite` (dipake tombol bintang di
// PokemonCard), tapi di halaman ini semua Pokemon yang ditampilin UDAH
// jadi favorite — jadi tombolnya cuma bakal kepake buat REMOVE (yang
// ditangani PokemonCard sendiri lewat removeFavorite, gak lewat prop
// ini). `onAddFavorite` gak pernah beneran ke-panggil di sini.
const noop = () => {}

const FavoritesPage = () => {
	const favorites = useFavoriteStore((state) => state.favorites)

	return (
		<>
			<h1 className="page-title">Favorites</h1>

			{favorites.length === 0 ? (
				<p className="status-message">No favorite pokemon yet.</p>
			) : (
				<PokemonList data={favorites} onAddFavorite={noop} />
			)}
		</>
	)
}

export default FavoritesPage
