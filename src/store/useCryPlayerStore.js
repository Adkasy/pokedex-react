import { create } from "zustand"

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
