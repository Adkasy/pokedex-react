import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

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

				set((state) => {
					return {
						favorites: newFavoriteList,
					}
				})

				console.log(get().favorites, "cek ini")
			},
		}),

		{
			name: "Favorites Pokemon",
			// storage: createJSONStorage(() => sessionStorage),
		},
	),
)
