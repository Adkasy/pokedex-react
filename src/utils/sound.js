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

// Stinger pembuka battle — MURNI sword clash "tring!": 2 nada tinggi
// detuned (logam beradu) + transient noise band-pass pendek. Gak ada
// lapisan rendah/riser/gong lagi — itu semua yang bikin kedengeran ada
// unsur "boom"-nya, padahal maunya cuma bunyi pedang doang.
export const playBattleStartSound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		// 2 nada tinggi dikit detuned biar berasa 2 pedang beradu, bukan 1
		// bunyi "beep" doang
		;[2600, 3150].forEach((freq, i) => {
			const clash = ctx.createOscillator()
			const clashGain = ctx.createGain()
			clash.type = "triangle"
			clash.frequency.setValueAtTime(freq, now + i * 0.02)
			clashGain.gain.setValueAtTime(0.18, now + i * 0.02)
			clashGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.4)
			clash.connect(clashGain)
			clashGain.connect(ctx.destination)
			clash.start(now + i * 0.02)
			clash.stop(now + i * 0.02 + 0.4)
		})

		// transient noise band-pass tinggi buat "kilat" logamnya pas kena
		const clashNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate)
		const clashNoiseData = clashNoiseBuffer.getChannelData(0)
		for (let i = 0; i < clashNoiseData.length; i++) {
			clashNoiseData[i] = (Math.random() * 2 - 1) * (1 - i / clashNoiseData.length)
		}
		const clashNoise = ctx.createBufferSource()
		clashNoise.buffer = clashNoiseBuffer
		const clashFilter = ctx.createBiquadFilter()
		clashFilter.type = "bandpass"
		clashFilter.frequency.value = 3600
		clashFilter.Q.value = 1.4
		const clashNoiseGain = ctx.createGain()
		clashNoiseGain.gain.setValueAtTime(0.4, now)
		clashNoiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
		clashNoise.connect(clashFilter)
		clashFilter.connect(clashNoiseGain)
		clashNoiseGain.connect(ctx.destination)
		clashNoise.start(now)
	} catch {
		// silent
	}
}

// Fanfare kemenangan, 3 babak: (1) stab akor pembuka yang langsung
// "nendang", (2) arpeggio naik C-E-G-C dengan bass di tiap not, (3) akor
// final yang nge-ring panjang dibarengin sparkle cascade naik di atasnya
// — biar berasa kayak fanfare beneran, bukan cuma satu arpeggio pendek.
export const playVictorySound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		const playChord = (freqs, start, duration, level) => {
			freqs.forEach((freq) => {
				const osc = ctx.createOscillator()
				const gain = ctx.createGain()

				osc.type = "triangle"
				osc.frequency.setValueAtTime(freq, start)

				gain.gain.setValueAtTime(0, start)
				gain.gain.linearRampToValueAtTime(level, start + 0.02)
				gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

				osc.connect(gain)
				gain.connect(ctx.destination)

				osc.start(start)
				osc.stop(start + duration)
			})
		}

		// (1) stab akor C major penuh, punchy — kesan "TA-DA!" pembuka
		playChord([261.63, 329.63, 392, 523.25], now, 0.22, 0.15) // C4 E4 G4 C5

		// (2) arpeggio naik, tiap not dikasih bass 1 oktaf di bawah
		const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
		const arpStart = now + 0.16

		notes.forEach((freq, i) => {
			const start = arpStart + i * 0.11
			const duration = 0.18

			playChord([freq], start, duration, 0.19)

			const bass = ctx.createOscillator()
			const bassGain = ctx.createGain()
			bass.type = "sine"
			bass.frequency.setValueAtTime(freq / 2, start)
			bassGain.gain.setValueAtTime(0, start)
			bassGain.gain.linearRampToValueAtTime(0.12, start + 0.02)
			bassGain.gain.exponentialRampToValueAtTime(0.001, start + duration)
			bass.connect(bassGain)
			bassGain.connect(ctx.destination)
			bass.start(start)
			bass.stop(start + duration)
		})

		// (3) akor final nge-ring panjang, ditumpuk sparkle cascade naik
		// di atasnya — ini bagian "megah"-nya
		const finalStart = arpStart + notes.length * 0.11
		playChord([523.25, 659.25, 783.99, 1046.5], finalStart, 1.3, 0.11) // C5 E5 G5 C6

		const sparkleNotes = [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093] // C6 D6 E6 G6 A6 C7
		sparkleNotes.forEach((freq, i) => {
			const start = finalStart + 0.1 + i * 0.07

			const osc = ctx.createOscillator()
			const gain = ctx.createGain()

			osc.type = "sine"
			osc.frequency.setValueAtTime(freq, start)

			gain.gain.setValueAtTime(0, start)
			gain.gain.linearRampToValueAtTime(0.11, start + 0.015)
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)

			osc.connect(gain)
			gain.connect(ctx.destination)

			osc.start(start)
			osc.stop(start + 0.4)
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
