// Semua efek suara di file ini disintesis langsung lewat Web Audio API
// (gak ada file .mp3/.wav yang di-load) — dua "bahan dasar" di bawah
// dipakai berulang buat nyusun tiap efek:
//   - playNoiseBurst: white noise yang di-filter + di-envelope, buat
//     bagian yang berisik/transient (crack, whoosh, dst)
//   - playTone: 1 oscillator (nadanya boleh geser) + di-envelope, buat
//     bagian yang lebih "musikal" (nada clash, sub-bass punch, dst)

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

const createNoiseBuffer = (ctx, duration) => {
	const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
	const data = buffer.getChannelData(0)
	for (let i = 0; i < data.length; i++) {
		// makin ke belakang makin pelan (fade-out linear) biar potongan
		// noise-nya kedengeran kayak "burst" natural, bukan dipotong kasar
		data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
	}
	return buffer
}

/**
 * White noise yang di-filter (band-pass/high-pass, boleh nyapu naik/turun)
 * lalu dikasih envelope volume. gainAttack opsional — kalau di-isi,
 * volumenya naik dulu ke gainPeak (bukan langsung di titik puncak).
 */
const playNoiseBurst = (
	ctx,
	{ startTime, duration, filterType = "bandpass", freq, freqTo, Q = 1, gainPeak, gainAttack = 0, decayTime = duration },
) => {
	const source = ctx.createBufferSource()
	source.buffer = createNoiseBuffer(ctx, duration)

	const filter = ctx.createBiquadFilter()
	filter.type = filterType
	filter.Q.value = Q
	if (freqTo !== undefined) {
		filter.frequency.setValueAtTime(freq, startTime)
		filter.frequency.exponentialRampToValueAtTime(freqTo, startTime + duration)
	} else {
		filter.frequency.value = freq
	}

	const gain = ctx.createGain()
	if (gainAttack > 0) {
		gain.gain.setValueAtTime(0.001, startTime)
		gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + gainAttack)
	} else {
		gain.gain.setValueAtTime(gainPeak, startTime)
	}
	gain.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime)

	source.connect(filter)
	filter.connect(gain)
	gain.connect(ctx.destination)
	source.start(startTime)
}

/**
 * 1 oscillator (frequency boleh nyapu dari `freq` ke `freqTo`) + envelope
 * volume. gainAttack opsional — kalau di-isi, volumenya naik dulu ke
 * gainPeak (bukan langsung di titik puncak).
 */
const playTone = (ctx, { startTime, duration, type = "sine", freq, freqTo, gainPeak, gainAttack = 0 }) => {
	const osc = ctx.createOscillator()
	osc.type = type
	osc.frequency.setValueAtTime(freq, startTime)
	if (freqTo !== undefined) {
		osc.frequency.exponentialRampToValueAtTime(freqTo, startTime + duration)
	}

	const gain = ctx.createGain()
	if (gainAttack > 0) {
		gain.gain.setValueAtTime(0.001, startTime)
		gain.gain.linearRampToValueAtTime(gainPeak, startTime + gainAttack)
	} else {
		gain.gain.setValueAtTime(gainPeak, startTime)
	}
	gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

	osc.connect(gain)
	gain.connect(ctx.destination)
	osc.start(startTime)
	osc.stop(startTime + duration)
}

/**
 * 1 nada synth "futuristik" — 2 oscillator sawtooth dikit detuned (biar
 * kedengeran "lebar", bukan tipis kaya nada tunggal) numpuk lewat 1
 * lowpass filter yang cutoff-nya nyapu naik ("synth sweep"). Dipake
 * buat nyusun chord kemenangan, 1 pemanggilan = 1 nada di chord-nya.
 */
const playSynthNote = (ctx, { startTime, freq, gainPeak, duration }) => {
	const osc1 = ctx.createOscillator()
	const osc2 = ctx.createOscillator()
	osc1.type = "sawtooth"
	osc2.type = "sawtooth"
	osc1.frequency.setValueAtTime(freq, startTime)
	osc2.frequency.setValueAtTime(freq * 1.006, startTime)

	const filter = ctx.createBiquadFilter()
	filter.type = "lowpass"
	filter.Q.value = 0.8
	filter.frequency.setValueAtTime(400, startTime)
	filter.frequency.exponentialRampToValueAtTime(5200, startTime + 0.15)

	const gain = ctx.createGain()
	gain.gain.setValueAtTime(0, startTime)
	gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.03)
	gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

	osc1.connect(filter)
	osc2.connect(filter)
	filter.connect(gain)
	gain.connect(ctx.destination)
	osc1.start(startTime)
	osc2.start(startTime)
	osc1.stop(startTime + duration)
	osc2.stop(startTime + duration)
}

// Stinger pembuka battle — sword clash "tring!": 2 nada tinggi detuned
// (logam beradu) + transient noise band-pass pendek (kilatnya).
export const playBattleStartSound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		;[2600, 3150].forEach((freq, i) => {
			playTone(ctx, { startTime: now + i * 0.02, duration: 0.4, type: "triangle", freq, gainPeak: 0.18 })
		})

		playNoiseBurst(ctx, { startTime: now, duration: 0.12, freq: 3600, Q: 1.4, gainPeak: 0.4 })
	} catch {
		// silent — audio gagal nyala (autoplay policy dll) gak boleh bikin battle-nya error
	}
}

// Fanfare kemenangan, 4 lapis numpuk jadi 1: riser (kesan "membangun"
// sebelum meledak) → sub impact (bobotnya) → chord synth 5 nada lewat
// playSynthNote (badan "megah"-nya) → shimmer nada tinggi (efek sparkle).
export const playVictorySound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime
		const hitStart = now + 0.3

		playNoiseBurst(ctx, {
			startTime: now,
			duration: 0.34,
			freq: 300,
			freqTo: 4200,
			Q: 0.7,
			gainAttack: 0.28,
			gainPeak: 0.22,
			decayTime: 0.36,
		})

		playTone(ctx, { startTime: hitStart, duration: 0.5, freq: 95, freqTo: 40, gainPeak: 0.4 })

		const chordFreqs = [523.25, 659.25, 783.99, 987.77, 1046.5] // C5 E5 G5 B5 C6
		chordFreqs.forEach((freq, i) => {
			playSynthNote(ctx, { startTime: hitStart + i * 0.035, freq, gainPeak: 0.1, duration: 0.9 })
		})

		const shimmerFreqs = [2093, 2637, 3136, 2794]
		shimmerFreqs.forEach((freq, i) => {
			playTone(ctx, { startTime: hitStart + 0.1 + i * 0.09, duration: 0.35, freq, gainPeak: 0.08, gainAttack: 0.01 })
		})
	} catch {
		// silent — audio gagal nyala (autoplay policy dll) gak boleh bikin battle-nya error
	}
}

// Bunyi hit — whoosh (kesan ayunan/serangan motong angin) yang nyusul
// jadi crack + body + sub punch (impact-nya). Crit dapet versi lebih
// tebal/tinggi di semua lapisnya biar bedanya kerasa jelas.
export const playHitSound = (isCrit = false) => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		playNoiseBurst(ctx, {
			startTime: now,
			duration: 0.09,
			freq: 650,
			freqTo: isCrit ? 3600 : 2800,
			Q: 1.1,
			gainAttack: 0.05,
			gainPeak: isCrit ? 0.42 : 0.3,
		})

		// impact-nya nyusul abis whoosh-nya sempet kedenger dulu
		const impactStart = now + 0.07

		playNoiseBurst(ctx, {
			startTime: impactStart,
			duration: 0.055,
			filterType: "highpass",
			freq: isCrit ? 2400 : 1800,
			gainPeak: isCrit ? 0.8 : 0.6,
		})

		playNoiseBurst(ctx, {
			startTime: impactStart,
			duration: 0.14,
			freq: isCrit ? 550 : 380,
			Q: 0.7,
			gainPeak: isCrit ? 0.6 : 0.42,
		})

		playTone(ctx, {
			startTime: impactStart,
			duration: 0.16,
			freq: isCrit ? 160 : 115,
			freqTo: 35,
			gainPeak: isCrit ? 0.55 : 0.4,
		})
	} catch {
		// silent — audio gagal nyala (autoplay policy dll) gak boleh bikin battle-nya error
	}
}

export const playFavoriteSound = () => {
	try {
		const ctx = getAudioContext()
		playTone(ctx, { startTime: ctx.currentTime, duration: 0.2, freq: 600, freqTo: 1200, gainPeak: 0.15 })
	} catch {
		// silent — audio gagal nyala (autoplay policy dll) gak boleh bikin favorite-nya error
	}
}
