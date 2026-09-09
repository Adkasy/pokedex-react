import { create } from "zustand"
import { persist } from "zustand/middleware"

// Daftar Pokemon favorite user — tombol bintangnya ada di PokemonCard
// (dipake di grid & FavoritesPage) dan di header PokemonDetailPage.
// FavoritesPage nampilin `favorites` di sini apa adanya. `persist`
// nyimpen ke localStorage otomatis, jadi favorite-nya masih ada abis
// browser di-refresh/ditutup.
export const useFavoriteStore = create(
	persist(
		(set, get) => ({
			favorites: [],

			addFavorite: (pokemon) => {
				if (!pokemon?.id || !pokemon.name) return

				const isAlreadyFavorite = get().favorites.some(
					(f) => f.id === pokemon.id,
				)

				if (isAlreadyFavorite) return

				set((state) => {
					return {
						favorites: [...state.favorites, pokemon],
					}
				})
			},

			removeFavorite: (pokemonId) => {
				const newFavoriteList = get().favorites.filter(
					(f) => f.id !== pokemonId,
				)

				set({ favorites: newFavoriteList })
			},
		}),

		{
			name: "Favorites Pokemon",
		},
	),
)
