import { create } from "zustand"
import {
	BASE_URL,
	getPokemonIndex,
	getPokemonNamesByType,
	getDataDetailPokemon,
} from "../api/pokeapi"

// Store terpusat buat data Pokemon: nyimpen index RINGAN semua Pokemon
// (id + nama + gambar doang) sekali di awal, terus detail lengkap
// (stats, types, dll) di-cache di sini per-nama begitu ada halaman yang
// butuh — jadi gak perlu fetch detail buat SEMUA Pokemon di awal.
export const usePokemonStore = create((set, get) => ({
	index: [],
	isIndexLoading: true,
	indexError: null,

	detailsByName: {},
	pendingDetailNames: new Set(),

	typeMembers: {},
	pendingTypeNames: new Set(),

	loadIndex: async () => {
		if (get().index.length > 0) return

		set({ isIndexLoading: true, indexError: null })

		try {
			const index = await getPokemonIndex()
			set({ index, isIndexLoading: false })
		} catch (err) {
			set({ indexError: err, isIndexLoading: false })
		}
	},

	// Pastiin detail lengkap buat daftar nama ini udah ke-cache — yang
	// udah ada (atau lagi di-fetch) di-skip, cuma yang beneran belum ada
	// yang di-fetch.
	ensureDetails: async (names) => {
		const { detailsByName, pendingDetailNames } = get()
		const missing = names.filter(
			(n) => n && !detailsByName[n] && !pendingDetailNames.has(n),
		)
		if (missing.length === 0) return

		set({ pendingDetailNames: new Set([...pendingDetailNames, ...missing]) })

		try {
			const details = await Promise.all(
				missing.map((n) => getDataDetailPokemon(`${BASE_URL}/pokemon/${n}`)),
			)

			set((state) => {
				const nextDetails = { ...state.detailsByName }
				details.forEach((d) => {
					nextDetails[d.name] = d
				})

				const nextPending = new Set(state.pendingDetailNames)
				missing.forEach((n) => nextPending.delete(n))

				return { detailsByName: nextDetails, pendingDetailNames: nextPending }
			})
		} catch {
			// gagal fetch — lepas dari pending biar bisa dicoba lagi nanti,
			// halaman yang minta cukup nampilin skeleton/loading terus
			set((state) => {
				const nextPending = new Set(state.pendingDetailNames)
				missing.forEach((n) => nextPending.delete(n))
				return { pendingDetailNames: nextPending }
			})
		}
	},

	// Pastiin daftar nama Pokemon per type ini udah ke-cache — dipake
	// buat filter by type tanpa perlu tau detail SEMUA Pokemon dulu.
	ensureTypeMembers: async (typeNames) => {
		const { typeMembers, pendingTypeNames } = get()
		const missing = typeNames.filter(
			(t) => t && !typeMembers[t] && !pendingTypeNames.has(t),
		)
		if (missing.length === 0) return

		set({ pendingTypeNames: new Set([...pendingTypeNames, ...missing]) })

		try {
			const results = await Promise.all(
				missing.map((t) => getPokemonNamesByType(t)),
			)

			set((state) => {
				const nextMembers = { ...state.typeMembers }
				missing.forEach((t, i) => {
					nextMembers[t] = new Set(results[i])
				})

				const nextPending = new Set(state.pendingTypeNames)
				missing.forEach((t) => nextPending.delete(t))

				return { typeMembers: nextMembers, pendingTypeNames: nextPending }
			})
		} catch {
			set((state) => {
				const nextPending = new Set(state.pendingTypeNames)
				missing.forEach((t) => nextPending.delete(t))
				return { pendingTypeNames: nextPending }
			})
		}
	},
}))
