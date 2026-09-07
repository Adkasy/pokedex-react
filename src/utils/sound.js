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

// Fanfare kemenangan — versi lebih megah/futuristik, 4 lapis yang
// numpuk jadi 1: (1) riser noise band-pass yang cutoff-nya nyapu naik
// cepet (kesan "membangun" sebelum meledak), (2) sub impact pas
// riser-nya nyampe puncak (bobot/dampaknya), (3) chord synth sawtooth
// detuned + lowpass sweep (bukan triangle polos lagi — ini yang bikin
// kedengeran "synth futuristik", bukan kotak musik), (4) shimmer nada
// tinggi nyebar di atasnya buat efek "sparkle". Modern synth-y, bukan
// fanfare akustik biasa.
export const playVictorySound = () => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		// (1) riser — noise band-pass, cutoff-nya naik cepet
		const riserBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.34, ctx.sampleRate)
		const riserData = riserBuffer.getChannelData(0)
		for (let i = 0; i < riserData.length; i++) {
			riserData[i] = Math.random() * 2 - 1
		}
		const riser = ctx.createBufferSource()
		riser.buffer = riserBuffer
		const riserFilter = ctx.createBiquadFilter()
		riserFilter.type = "bandpass"
		riserFilter.Q.value = 0.7
		riserFilter.frequency.setValueAtTime(300, now)
		riserFilter.frequency.exponentialRampToValueAtTime(4200, now + 0.32)
		const riserGain = ctx.createGain()
		riserGain.gain.setValueAtTime(0.001, now)
		riserGain.gain.exponentialRampToValueAtTime(0.22, now + 0.28)
		riserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36)
		riser.connect(riserFilter)
		riserFilter.connect(riserGain)
		riserGain.connect(ctx.destination)
		riser.start(now)

		const hitStart = now + 0.3

		// (2) sub impact — nge-drop pas riser-nya nyampe puncak
		const sub = ctx.createOscillator()
		const subGain = ctx.createGain()
		sub.type = "sine"
		sub.frequency.setValueAtTime(95, hitStart)
		sub.frequency.exponentialRampToValueAtTime(40, hitStart + 0.4)
		subGain.gain.setValueAtTime(0.4, hitStart)
		subGain.gain.exponentialRampToValueAtTime(0.001, hitStart + 0.5)
		sub.connect(subGain)
		subGain.connect(ctx.destination)
		sub.start(hitStart)
		sub.stop(hitStart + 0.5)

		// (3) chord synth — sawtooth 2x detuned tipis (biar "lebar") lewat
		// lowpass yang cutoff-nya nyapu naik ("synth sweep" khas
		// futuristik), chord-nya lebih gede (5 nada) daripada arpeggio
		// simpel sebelumnya
		const chordFreqs = [523.25, 659.25, 783.99, 987.77, 1046.5] // C5 E5 G5 B5 C6
		chordFreqs.forEach((freq, i) => {
			const start = hitStart + i * 0.035

			const osc1 = ctx.createOscillator()
			const osc2 = ctx.createOscillator()
			osc1.type = "sawtooth"
			osc2.type = "sawtooth"
			osc1.frequency.setValueAtTime(freq, start)
			osc2.frequency.setValueAtTime(freq * 1.006, start)

			const filter = ctx.createBiquadFilter()
			filter.type = "lowpass"
			filter.Q.value = 0.8
			filter.frequency.setValueAtTime(400, start)
			filter.frequency.exponentialRampToValueAtTime(5200, start + 0.15)

			const gain = ctx.createGain()
			gain.gain.setValueAtTime(0, start)
			gain.gain.linearRampToValueAtTime(0.1, start + 0.03)
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9)

			osc1.connect(filter)
			osc2.connect(filter)
			filter.connect(gain)
			gain.connect(ctx.destination)

			osc1.start(start)
			osc2.start(start)
			osc1.stop(start + 0.9)
			osc2.stop(start + 0.9)
		})

		// (4) shimmer — beberapa nada tinggi pendek, nyebar dikit2 di atas
		// chord-nya buat efek "sparkle"
		const shimmerFreqs = [2093, 2637, 3136, 2794]
		shimmerFreqs.forEach((freq, i) => {
			const start = hitStart + 0.1 + i * 0.09
			const osc = ctx.createOscillator()
			const gain = ctx.createGain()

			osc.type = "sine"
			osc.frequency.setValueAtTime(freq, start)

			gain.gain.setValueAtTime(0, start)
			gain.gain.linearRampToValueAtTime(0.08, start + 0.01)
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

// Bunyi hit — 3 lapis biar lebih "berasa"/punchy daripada versi
// sebelumnya (yang cuma noise band-pass + 1 nada kotak, jadi kedengeran
// tipis): (1) crack tajam highpass-noise super pendek buat transient
// "krek"-nya, (2) body mid bandpass-noise yang lebih bertekstur
// (bukan tone oscillator murni) buat "thud"-nya, (3) sub punch sine
// yang jatuh cepet ke frekuensi rendah buat "dorongan" bass-nya —
// gabungan 3 ini yang bikin kerasa ada bobot beneran, bukan cuma
// "beep" logam. Crit dikasih gain & frekuensi lebih tinggi di
// ketiganya biar bedanya kerasa jelas.
export const playHitSound = (isCrit = false) => {
	try {
		const ctx = getAudioContext()
		const now = ctx.currentTime

		// (1) crack — transient tajam & super pendek
		const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.055, ctx.sampleRate)
		const crackData = crackBuffer.getChannelData(0)
		for (let i = 0; i < crackData.length; i++) {
			crackData[i] = (Math.random() * 2 - 1) * (1 - i / crackData.length)
		}
		const crack = ctx.createBufferSource()
		crack.buffer = crackBuffer
		const crackFilter = ctx.createBiquadFilter()
		crackFilter.type = "highpass"
		crackFilter.frequency.value = isCrit ? 2400 : 1800
		const crackGain = ctx.createGain()
		crackGain.gain.setValueAtTime(isCrit ? 0.8 : 0.6, now)
		crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
		crack.connect(crackFilter)
		crackFilter.connect(crackGain)
		crackGain.connect(ctx.destination)
		crack.start(now)

		// (2) body — noise band-pass mid, lebih bertekstur dari tone biasa
		const bodyBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.14, ctx.sampleRate)
		const bodyData = bodyBuffer.getChannelData(0)
		for (let i = 0; i < bodyData.length; i++) {
			bodyData[i] = (Math.random() * 2 - 1) * (1 - i / bodyData.length)
		}
		const body = ctx.createBufferSource()
		body.buffer = bodyBuffer
		const bodyFilter = ctx.createBiquadFilter()
		bodyFilter.type = "bandpass"
		bodyFilter.frequency.value = isCrit ? 550 : 380
		bodyFilter.Q.value = 0.7
		const bodyGain = ctx.createGain()
		bodyGain.gain.setValueAtTime(isCrit ? 0.6 : 0.42, now)
		bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
		body.connect(bodyFilter)
		bodyFilter.connect(bodyGain)
		bodyGain.connect(ctx.destination)
		body.start(now)

		// (3) sub punch — nada rendah yang jatuh cepet, ngasih "dorongan"
		const sub = ctx.createOscillator()
		const subGain = ctx.createGain()
		sub.type = "sine"
		sub.frequency.setValueAtTime(isCrit ? 160 : 115, now)
		sub.frequency.exponentialRampToValueAtTime(35, now + 0.1)
		subGain.gain.setValueAtTime(isCrit ? 0.55 : 0.4, now)
		subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
		sub.connect(subGain)
		subGain.connect(ctx.destination)
		sub.start(now)
		sub.stop(now + 0.16)
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
