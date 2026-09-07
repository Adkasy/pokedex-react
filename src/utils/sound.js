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

// Bunyi "krak" pas kena hit — noise band-pass pendek (transient
// tajam/"krek"-nya) numpuk sama nada kotak yang jatuh cepet dari
// tinggi ke rendah (body "thwack"-nya, ngasih kesan ada bobot/dampak).
// Crit hit dikasih versi lebih tebal/tinggi biar kerasa beda dari hit
// biasa tanpa perlu bikin sound terpisah dari nol.
export const playHitSound = (isCrit = false) => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.09, ctx.sampleRate)
		const noiseData = noiseBuffer.getChannelData(0)
		for (let i = 0; i < noiseData.length; i++) {
			noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length)
		}
		const noise = ctx.createBufferSource()
		noise.buffer = noiseBuffer
		const noiseFilter = ctx.createBiquadFilter()
		noiseFilter.type = "bandpass"
		noiseFilter.frequency.value = isCrit ? 1900 : 1200
		noiseFilter.Q.value = 0.9
		const noiseGain = ctx.createGain()
		noiseGain.gain.setValueAtTime(isCrit ? 0.5 : 0.35, now)
		noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
		noise.connect(noiseFilter)
		noiseFilter.connect(noiseGain)
		noiseGain.connect(ctx.destination)
		noise.start(now)

		const thump = ctx.createOscillator()
		const thumpGain = ctx.createGain()
		thump.type = "square"
		thump.frequency.setValueAtTime(isCrit ? 260 : 180, now)
		thump.frequency.exponentialRampToValueAtTime(40, now + 0.12)
		thumpGain.gain.setValueAtTime(isCrit ? 0.3 : 0.22, now)
		thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
		thump.connect(thumpGain)
		thumpGain.connect(ctx.destination)
		thump.start(now)
		thump.stop(now + 0.14)
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
