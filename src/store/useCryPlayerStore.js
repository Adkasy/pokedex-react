import { create } from "zustand"

// nge-track ID Pokemon yang cry-nya lagi kepencet play — dibaca dari
// PokemonCard & BattleArena (buat nunjukin tombol play mana yang lagi
// aktif). Cuma boleh 1 cry nyala berbarengan se-APP, makanya di-taro di
// store global (bukan state lokal masing-masing tombol).
//
// `activeAudio` (objek Audio-nya sendiri) SENGAJA ditaro di LUAR
// state Zustand di atas — dia bukan data yang perlu bikin UI re-render,
// cuma dipake internal buat `.pause()` cry sebelumnya kalau ada yang baru
// diputer.
let activeAudio = null

export const useCryPlayerStore = create((set, get) => ({
	playingId: null,

	playCry: (id, url) => {
		if (!url) return

		if (activeAudio) {
			activeAudio.pause()
			activeAudio = null
		}

		if (get().playingId === id) {
			set({ playingId: null })
			return
		}

		const audio = new Audio(url)
		audio.volume = 0.6
		audio.addEventListener("ended", () => set({ playingId: null }))
		audio.play().catch(() => set({ playingId: null }))

		activeAudio = audio
		set({ playingId: id })
	},
}))
