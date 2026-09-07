let sharedAudioContext = null

const getAudioContext = () => {
	const AudioCtx = window.AudioContext || window.webkitAudioContext
	if (!sharedAudioContext) {
		sharedAudioContext = new AudioCtx()
	}

	if (sharedAudioContext.state === "suspended") {
		sharedAudioContext.resume()
	}

	return sharedAudioContext
}

// Fanfare kemenangan — arpeggio 4 nada naik (C-E-G-C, major triad),
// tiap nada nyusul dikit-dikit terus nada terakhir dibiarin nge-ring
// lebih lama biar berasa "ini menang beneran", bukan cuma "pop" biasa.
export const playVictorySound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime
		const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

		notes.forEach((freq, i) => {
			const start = now + i * 0.11
			const duration = i === notes.length - 1 ? 0.5 : 0.16

			const osc = ctx.createOscillator()
			const gain = ctx.createGain()

			osc.type = "triangle"
			osc.frequency.setValueAtTime(freq, start)

			gain.gain.setValueAtTime(0, start)
			gain.gain.linearRampToValueAtTime(0.18, start + 0.02)
			gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

			osc.connect(gain)
			gain.connect(ctx.destination)

			osc.start(start)
			osc.stop(start + duration)
		})
	} catch {
		// silent
	}
}

export const playFavoriteSound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		const osc = ctx.createOscillator()
		const gain = ctx.createGain()

		osc.type = "sine"
		osc.frequency.setValueAtTime(600, now)
		osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1)

		gain.gain.setValueAtTime(0.15, now)
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

		osc.connect(gain)
		gain.connect(ctx.destination)

		osc.start(now)
		osc.stop(now + 0.2)
	} catch {
		// silent
	}
}
