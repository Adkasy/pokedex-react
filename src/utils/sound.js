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

// Stinger pembuka battle — mulai dari sword clash "tring!" (2 nada
// tinggi detuned + transient noise metalik), disusul riser naik yang
// ngasih energi, terus gong yang nge-ring di belakang. Gak ada
// kick/bass rendah lagi — itu yang bikin awalnya kedengeran "BOOM"
// aneh, gak nyambung sama tema pedang.
export const playBattleStartSound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		// sword clash "tring!" — 2 nada tinggi dikit detuned (logam beradu)
		// + transient noise band-pass pendek biar berasa ada "kilat" logamnya
		;[2600, 2950].forEach((freq) => {
			const clash = ctx.createOscillator()
			const clashGain = ctx.createGain()
			clash.type = "triangle"
			clash.frequency.setValueAtTime(freq, now)
			clashGain.gain.setValueAtTime(0.16, now)
			clashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
			clash.connect(clashGain)
			clashGain.connect(ctx.destination)
			clash.start(now)
			clash.stop(now + 0.45)
		})

		const clashNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate)
		const clashNoiseData = clashNoiseBuffer.getChannelData(0)
		for (let i = 0; i < clashNoiseData.length; i++) {
			clashNoiseData[i] = (Math.random() * 2 - 1) * (1 - i / clashNoiseData.length)
		}
		const clashNoise = ctx.createBufferSource()
		clashNoise.buffer = clashNoiseBuffer
		const clashFilter = ctx.createBiquadFilter()
		clashFilter.type = "bandpass"
		clashFilter.frequency.value = 3200
		clashFilter.Q.value = 1.2
		const clashNoiseGain = ctx.createGain()
		clashNoiseGain.gain.setValueAtTime(0.35, now)
		clashNoiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
		clashNoise.connect(clashFilter)
		clashFilter.connect(clashNoiseGain)
		clashNoiseGain.connect(ctx.destination)
		clashNoise.start(now)

		// riser: nanjak abis impact-nya, ngasih rasa "energi lagi ngumpul"
		const riser = ctx.createOscillator()
		const riserGain = ctx.createGain()
		riser.type = "sawtooth"
		riser.frequency.setValueAtTime(180, now + 0.08)
		riser.frequency.exponentialRampToValueAtTime(760, now + 0.4)
		riserGain.gain.setValueAtTime(0.001, now + 0.08)
		riserGain.gain.linearRampToValueAtTime(0.16, now + 0.2)
		riserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
		riser.connect(riserGain)
		riserGain.connect(ctx.destination)
		riser.start(now + 0.08)
		riser.stop(now + 0.45)

		// gong metalik: 2 nada dikit detuned (inharmonic) biar berasa logam,
		// decay panjang buat nge-ring di belakang teks "Battle Begin!"
		;[220, 233].forEach((freq) => {
			const gong = ctx.createOscillator()
			const gongGain = ctx.createGain()
			gong.type = "triangle"
			gong.frequency.setValueAtTime(freq, now)
			gongGain.gain.setValueAtTime(0, now)
			gongGain.gain.linearRampToValueAtTime(0.09, now + 0.03)
			gongGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95)
			gong.connect(gongGain)
			gongGain.connect(ctx.destination)
			gong.start(now)
			gong.stop(now + 0.95)
		})
	} catch {
		// silent
	}
}

// Fanfare kemenangan — arpeggio 4 nada naik (C-E-G-C, major triad) tiap
// nada dikasih lapisan bass 1 oktaf di bawah biar lebih "berbobot", terus
// abis itu ada flourish sparkle (nada tinggi cepet naik) biar berasa lebih
// spektakuler, bukan cuma arpeggio polos.
export const playVictorySound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime
		const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

		notes.forEach((freq, i) => {
			const start = now + i * 0.11
			const duration = i === notes.length - 1 ? 0.6 : 0.16

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

			// bass 1 oktaf di bawah nada utama, nambah "bobot" tiap not
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

		// flourish sparkle abis arpeggio utama kelar — nada pentatonic
		// cepet naik biar berasa "shimmer", kayak confetti versi suara
		const sparkleStart = now + notes.length * 0.11 + 0.06
		const sparkleNotes = [1046.5, 1174.66, 1318.51, 1567.98, 2093] // C6 D6 E6 G6 C7

		sparkleNotes.forEach((freq, i) => {
			const start = sparkleStart + i * 0.06

			const osc = ctx.createOscillator()
			const gain = ctx.createGain()

			osc.type = "sine"
			osc.frequency.setValueAtTime(freq, start)

			gain.gain.setValueAtTime(0, start)
			gain.gain.linearRampToValueAtTime(0.1, start + 0.015)
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)

			osc.connect(gain)
			gain.connect(ctx.destination)

			osc.start(start)
			osc.stop(start + 0.35)
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
