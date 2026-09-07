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

// Stinger pembuka battle — numpuk beberapa layer biar berasa kayak
// "impact hit" di game fighting: kick rendah yang mletak (pitch turun
// cepat), noise burst pendek buat "clang", riser naik yang ngasih
// energi, terus gong metalik yang nge-ring lama di belakang.
export const playBattleStartSound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		// kick: freq turun cepat dari 160 ke 45Hz, envelope tajam = "BOOM"
		const kick = ctx.createOscillator()
		const kickGain = ctx.createGain()
		kick.type = "sine"
		kick.frequency.setValueAtTime(160, now)
		kick.frequency.exponentialRampToValueAtTime(45, now + 0.22)
		kickGain.gain.setValueAtTime(0.9, now)
		kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
		kick.connect(kickGain)
		kickGain.connect(ctx.destination)
		kick.start(now)
		kick.stop(now + 0.4)

		// noise burst pendek (di-highpass biar "clang", bukan "hiss")
		const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate)
		const noiseData = noiseBuffer.getChannelData(0)
		for (let i = 0; i < noiseData.length; i++) {
			noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length)
		}
		const noise = ctx.createBufferSource()
		noise.buffer = noiseBuffer
		const noiseFilter = ctx.createBiquadFilter()
		noiseFilter.type = "highpass"
		noiseFilter.frequency.value = 1500
		const noiseGain = ctx.createGain()
		noiseGain.gain.setValueAtTime(0.3, now)
		noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
		noise.connect(noiseFilter)
		noiseFilter.connect(noiseGain)
		noiseGain.connect(ctx.destination)
		noise.start(now)

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
			gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)
			gong.connect(gongGain)
			gongGain.connect(ctx.destination)
			gong.start(now)
			gong.stop(now + 1.1)
		})
	} catch {
		// silent
	}
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
