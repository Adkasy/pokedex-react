import { useEffect, useRef, useState } from "react"
import { GiCrossedSwords, GiTrophy } from "react-icons/gi"
import { MdInfoOutline, MdClose } from "react-icons/md"
import { simulateBattle } from "../utils/battleSimulator"
import { getPrimaryTypeColor } from "../constants/typeColors"
import { playVictorySound, playBattleStartSound, playHitSound } from "../utils/sound"
import PokemonImage from "./PokemonImage"

const REVEAL_DELAY_MS = 500
const BATTLE_BEGIN_MS = 950
const SPARK_COUNT = 7
const CONFETTI_COLORS = ["#ff6b57", "#5b9dff", "#34d399", "#fbbf24", "#e879f9"]
const CONFETTI_COUNT = 70

const BattleBeginOverlay = () => (
	<div className="battle-begin-overlay" aria-hidden="true">
		<div className="battle-begin-flash" />
		<div className="battle-begin-rays" />
		<div className="battle-begin-ring" />
		<div className="battle-begin-slash" />
		<div className="battle-begin-text">
			<GiCrossedSwords size={52} />
			Battle Begin!
			<GiCrossedSwords size={52} />
		</div>
	</div>
)

const BattleHpBar = ({ name, hp, maxHp }) => {
	const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0
	const isFainted = pct <= 0
	const isLow = !isFainted && pct <= 25

	return (
		<div className="battle-hp">
			<div className="battle-hp-label">
				<span className="battle-hp-name">{name}</span>
				<span className="battle-hp-value">
					HP {Math.max(0, Math.round(hp))} / {maxHp}
				</span>
			</div>
			<div className="battle-hp-track">
				<div
					className={`battle-hp-fill${isFainted ? " is-fainted" : isLow ? " is-low" : ""}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	)
}

// percikan yang mumbul dari ujung tebasan pas kena hit — beberapa garis
// pendek yang sebar ke segala arah terus ilang cepet
const HitSparks = () => {
	// lazy initializer — cuma jalan sekali pas mount, jadi generate arah
	// random di sini valid (SlashFX di bawah di-remount tiap hit lewat
	// key={revealCount}, jadi percikannya otomatis dapet arah baru tiap kali)
	const [sparks] = useState(() =>
		Array.from({ length: SPARK_COUNT }).map((_, i) => ({
			id: i,
			angle: (360 / SPARK_COUNT) * i + (Math.random() * 24 - 12),
			dist: 14 + Math.random() * 12,
			len: 5 + Math.random() * 5,
			delay: Math.random() * 0.06,
		})),
	)

	return (
		<g className="battle-hit-sparks">
			{sparks.map((s) => (
				<line
					key={s.id}
					className="battle-hit-spark"
					x1="20"
					y1="89"
					x2="20"
					y2={89 - s.len}
					style={{
						"--spark-angle": `${s.angle}deg`,
						"--spark-dist": `${s.dist}px`,
						animationDelay: `${s.delay}s`,
					}}
				/>
			))}
		</g>
	)
}

// efek tebasan yang muncul sesaat di fighter yang kena hit — blade-nya
// digambar runcing di kiri-bawah/tumpul di kanan-atas, terus dibungkus
// <g transform="rotate(180 ...)"> biar arahnya kebalik jadi runcing di
// kanan-atas (muter grup-nya, bukan itung ulang tiap koordinat manual)
const SlashFX = () => (
	<svg className="battle-hit-slash" viewBox="0 0 100 100" aria-hidden="true">
		<g transform="rotate(180 50 50)">
			<path
				className="battle-hit-slash-claw"
				d="M20,89
					C12,56 24,24 62,14
					C68,11 74,9 80,7
					L75,14 L70,6 L66,16
					C48,22 26,40 20,89 Z"
			/>
			<HitSparks />
		</g>
	</svg>
)

const Confetti = () => {
	// lazy initializer — cuma jalan sekali pas mount (bukan tiap
	// render), jadi generate posisi random di sini valid/gak "impure"
	const [pieces] = useState(() =>
		Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
			id: i,
			left: Math.random() * 100,
			color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
			delay: Math.random() * 0.6,
			duration: 1.4 + Math.random() * 1.1,
			rotate: Math.random() * 360,
			scale: 0.6 + Math.random() * 0.8,
			round: i % 3 === 0,
		})),
	)

	return (
		<div className="battle-confetti" aria-hidden="true">
			{pieces.map((p) => (
				<span
					key={p.id}
					className={`battle-confetti-piece${p.round ? " is-round" : ""}`}
					style={{
						left: `${p.left}%`,
						backgroundColor: p.color,
						animationDelay: `${p.delay}s`,
						animationDuration: `${p.duration}s`,
						transform: `rotate(${p.rotate}deg) scale(${p.scale})`,
					}}
				/>
			))}
		</div>
	)
}

// popover "How damage works" — isinya statis (gak butuh state dari battle
// yang lagi jalan), jadi di-component-in sendiri biar return BattleArena
// utama lebih pendek/gampang dibaca
const BattleInfoPopover = ({ onClose }) => (
	<div className="battle-info-popover">
		<div className="battle-info-header">
			<p className="battle-info-title">How damage works</p>
			<button className="battle-info-close" onClick={onClose} aria-label="Close">
				<MdClose size={16} />
			</button>
		</div>

		<div className="battle-info-formula">
			<code className="f-chip f-chip-neutral">Damage</code>
			<span className="f-op">=</span>
			<code className="f-chip f-chip-atk">
				Attack <span className="f-op-inline">÷</span> Defense
			</code>
			<span className="f-op">×</span>
			<code className="f-chip f-chip-type">Type Effectiveness</code>
			<span className="f-op">×</span>
			<code className="f-chip f-chip-luck">Luck</code>
		</div>

		<ul className="battle-info-list">
			<li>
				<code className="f-chip f-chip-atk">
					Attack <span className="f-op-inline">÷</span> Defense
				</code>
				: the attacker&rsquo;s Attack against the target&rsquo;s Defense. Higher
				Attack (or a weaker target Defense) means more damage.
			</li>
			<li>
				<code className="f-chip f-chip-type">Type Effectiveness</code>: follows
				the same type chart as the games. e.g. Water beats Fire, Fire beats
				Grass, Grass beats Water. A super effective hit does more damage, a
				resisted hit does less.
			</li>
			<li>
				<code className="f-chip f-chip-luck">Luck</code>: a small random swing
				(75% to 100%), so a rematch won&rsquo;t always go the same way.
			</li>
		</ul>

		<p className="battle-info-subheading">Other battle rules</p>

		<ul className="battle-info-list">
			<li>
				<code className="f-chip f-chip-crit">Critical Hit</code>: on top of
				all that, every attack also has a small 10% chance to land a
				critical hit for 1.5 × extra damage.
			</li>
			<li>
				<code className="f-chip f-chip-neutral">30 Rounds</code>: if neither
				Pokémon is KO&rsquo;d by round 30, the battle ends in a draw instead
				of dragging on forever.
			</li>
		</ul>
	</div>
)

// 1 fighter (sprite + efek pas nyerang/kena hit/KO) — dipake 2x (side A
// & B) jadi di-component-in daripada nulis JSX yang sama dua kali
const BattleFighter = ({ side, pokemon, color, isActing, isHit, isFainted, revealCount }) => (
	<div
		className={`battle-fighter side-${side}${isActing ? " is-acting" : ""}${
			isHit ? " is-hit" : ""
		}${isFainted ? " is-fainted" : ""}`}
		style={{ "--fighter-color": color }}
	>
		<PokemonImage
			className="battle-fighter-image"
			src={pokemon.image}
			alt={pokemon.name}
			fallbackIconSize={102}
		/>
		{isHit && <SlashFX key={revealCount} />}
	</div>
)

// nekenin "N damage" jadi chip kecil di dalem teks log, bukan cuma
// nyempil polos di tengah kalimat — pure function (cuma butuh `entry`),
// jadi ditaro di luar component biar gampang dipake ulang/di-test
const renderAttackText = (entry) => {
	const marker = `${entry.damage} damage`
	const idx = entry.text.indexOf(marker)
	if (idx === -1) return entry.text

	return (
		<>
			{entry.text.slice(0, idx)}
			<span className={`battle-damage-chip${entry.isSuperEffective ? " is-super" : ""}`}>
				{entry.damage} damage
			</span>
			{entry.text.slice(idx + marker.length)}
		</>
	)
}

// 1 baris log battle — bubble percakapan buat entry "attack", teks
// tengah polos buat entry system lain ("X moves first!", "X is KO'd!")
const BattleChatEntry = ({ entry, isLatest, pokemon, color }) => {
	if (entry.type !== "attack") {
		return (
			<li className={`battle-chat-system${isLatest ? " is-latest" : ""}`}>
				{entry.text}
			</li>
		)
	}

	return (
		<li className={`battle-chat-row side-${entry.side}${isLatest ? " is-latest" : ""}`}>
			<PokemonImage className="battle-chat-avatar" src={pokemon.image} fallbackIconSize={62} />
			<div
				className={`battle-chat-bubble${entry.isCrit ? " is-crit" : ""}`}
				style={{ backgroundColor: color }}
			>
				{entry.isCrit && <span className="battle-crit-badge">💥 Critical Hit</span>}
				{renderAttackText(entry)}
			</div>
		</li>
	)
}

// banner kemenangan — confetti + sprite dengan spotlight warna type-nya
// + tombol "X wins!" yang bisa diklik ulang buat nembak confetti lagi
const BattleWinnerBanner = ({ pokemon, color, confettiBurst, onCelebrateAgain }) => (
	<div className="battle-winner">
		<Confetti key={confettiBurst} />
		<div className="battle-winner-spotlight" style={{ "--winner-color": color }}>
			<PokemonImage
				className="battle-winner-image"
				src={pokemon.image}
				alt={pokemon.name}
				fallbackIconSize={160}
			/>
		</div>
		<button className="battle-winner-ribbon" onClick={onCelebrateAgain} title="Celebrate again!">
			<GiTrophy size={16} />
			{pokemon.name} wins!
		</button>
	</div>
)

const BattleArena = ({ pokemonA, pokemonB }) => {
	const [battle, setBattle] = useState(null) // { log, maxHpA, maxHpB, winner, maxRounds }
	const [revealCount, setRevealCount] = useState(0)
	const [showInfo, setShowInfo] = useState(false)
	const [scoreboard, setScoreboard] = useState({ a: 0, b: 0, draw: 0 })
	// key buat maksa Confetti remount tiap ribbon-nya diklik lagi —
	// remount = piece random baru + animasi mulai dari awal lagi
	const [confettiBurst, setConfettiBurst] = useState(0)
	const [showBattleBegin, setShowBattleBegin] = useState(false)
	const logRef = useRef(null)
	const arenaRef = useRef(null)
	const infoWrapRef = useRef(null)
	const colorA = getPrimaryTypeColor(pokemonA.types)
	const colorB = getPrimaryTypeColor(pokemonB.types)

	// reveal log-nya 1 entry per tick (bukan langsung nampilin semua),
	// biar battle-nya kerasa "real-time" — timer di-reset tiap revealCount
	// berubah, jadi ini otomatis jalan berulang sampe log-nya abis
	useEffect(() => {
		if (!battle || revealCount >= battle.log.length) return

		const timer = setTimeout(() => {
			// begitu entry "faint" (salah satu Pokemon KO) kereveal, match-nya
			// dianggep kelar seketika — lompat langsung ke akhir log (skip
			// nunggu 1 tick lagi buat entry "result", yang toh gak
			// ditampilin di chat) biar gak ada jeda dimana si pemenang masih
			// sempet ke-highlight lagi abis lawannya udah jatuh
			const justRevealed = battle.log[revealCount]
			const nextCount =
				justRevealed?.type === "faint" ? battle.log.length : revealCount + 1
			setRevealCount(nextCount)

			// battle baru aja kereveal semua — sekalian catet skornya di sini
			// (di dalem callback, bukan langsung di body effect) sekali doang
			if (nextCount >= battle.log.length) {
				setScoreboard((prev) => ({
					...prev,
					[battle.winner]: prev[battle.winner] + 1,
				}))
			}
		}, REVEAL_DELAY_MS)

		return () => clearTimeout(timer)
	}, [battle, revealCount])

	// scroll ke bawah tiap ada entry baru MUNCUL — termasuk pas banner
	// winner-nya nongol (dia bagian dari kontainer scroll yang sama),
	// jadi gak perlu effect terpisah lagi buat itu
	useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "auto" })
	}, [revealCount])

	useEffect(() => {
		// effect ini jalan SETELAH React commit DOM-nya, jadi arenaRef.current
		// di sini udah pasti ke-render & posisinya akurat — gak perlu
		// requestAnimationFrame (yang malah bisa gak jalan kalau tab lagi
		// background/hidden). Tinggi arena-nya konstan sepanjang battle (chat
		// log scroll di kontainer fix-height-nya sendiri), jadi cukup sekali.
		if (!battle) return
		arenaRef.current?.scrollIntoView({ behavior: "auto", block: "start" })
	}, [battle])

	useEffect(() => {
		if (!showInfo) return

		const handleClickOutside = (e) => {
			if (!infoWrapRef.current?.contains(e.target)) setShowInfo(false)
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [showInfo])

	useEffect(() => {
		if (!showBattleBegin) return
		const timer = setTimeout(() => setShowBattleBegin(false), BATTLE_BEGIN_MS)
		return () => clearTimeout(timer)
	}, [showBattleBegin])

	const isSimulating = battle && revealCount < battle.log.length

	const handleSimulate = () => {
		setBattle(simulateBattle(pokemonA, pokemonB))
		setRevealCount(0)
		setShowBattleBegin(true)
		playBattleStartSound()
	}

	const visibleLog = battle ? battle.log.slice(0, revealCount) : []
	const latest = visibleLog[visibleLog.length - 1]
	// ngikutin round entry yang paling baru ke-reveal — jadi kelihatan
	// "real-time" nambah bareng jalannya pertarungan, bukan cuma angka
	// akhir yang muncul sekaligus
	const currentRound = latest?.round ?? 1
	const currentHpA = latest ? latest.hpA : (battle?.maxHpA ?? 0)
	const currentHpB = latest ? latest.hpB : (battle?.maxHpB ?? 0)

	// cuma entry "attack" yang bikin fighter-nya "is-acting" (lunge + glow)
	// — `side` di entry "faint" itu si Pokemon yang BARU KENA KO, bukan
	// yang nyerang, jadi kalau ikut dihitung, Pokemon yang udah kalah malah
	// kelihatan kesorot kayak mau nyerang lagi
	const activeSide = latest?.type === "attack" ? latest.side : null
	// sisi yang KENA hit — kebalikan dari activeSide pas lagi attack, jadi
	// fighter yang diserang bisa dikasih efek "kena" sendiri (kedip + geter
	// + tebasan), misah dari efek lunge/glow yang nempel di penyerang
	const hitSide = latest?.type === "attack" ? (latest.side === "a" ? "b" : "a") : null
	// aktif cuma buat 1 tick reveal doang — begitu `latest` pindah ke entry
	// berikutnya, shake/flash arena-nya otomatis berhenti sendiri
	const isSuperHit = latest?.type === "attack" && latest.isSuperEffective
	const isRevealed = battle && revealCount >= battle.log.length
	const winnerPokemon =
		isRevealed && battle.winner === "a"
			? pokemonA
			: isRevealed && battle.winner === "b"
				? pokemonB
				: null
	// warna spotlight di belakang sprite pemenang ngikutin type-nya sendiri
	// (bukan 1 warna flat) — biar tiap kemenangan kerasa beda & tetep
	// nyambung sama palet warna type yang udah dipake di seluruh arena
	const winnerColor = battle?.winner === "a" ? colorA : battle?.winner === "b" ? colorB : null

	useEffect(() => {
		if (winnerPokemon) playVictorySound()
	}, [winnerPokemon])

	// bunyi hit tiap ada attack entry baru ke-reveal — `latest` cuma ganti
	// reference pas revealCount beneran maju ke entry berikutnya (entry
	// object-nya sendiri reference yang sama dari battle.log), jadi efek
	// ini gak nembak berkali-kali gara-gara re-render biasa
	useEffect(() => {
		if (latest?.type === "attack") playHitSound(latest.isCrit)
	}, [latest])

	// "result" gak ditampilin di chat — udah ada banner winner-nya sendiri
	const chatEntries = visibleLog.filter((entry) => entry.type !== "result")

	return (
		<div className="battle-section">
			{showBattleBegin && <BattleBeginOverlay />}

			<button
				className="btn btn-primary battle-simulate-btn"
				onClick={handleSimulate}
				disabled={isSimulating}
			>
				<GiCrossedSwords size={18} />
				{isSimulating ? "Simulating…" : battle ? "Simulate Again" : "Simulate Battle"}
			</button>

			{battle && (
				<div
					className={`battle-arena${isSuperHit ? " is-shaking" : ""}`}
					ref={arenaRef}
				>
					{isSuperHit && <div key={revealCount} className="battle-hit-flash" />}

					<span className="battle-round-chip" title="Current round">
						Round {currentRound}
						<span className="battle-round-chip-max">/{battle.maxRounds}</span>
					</span>

					{(scoreboard.a > 0 || scoreboard.b > 0 || scoreboard.draw > 0) && (
						<div
							className="battle-scoreboard"
							title={`${pokemonA.name} ${scoreboard.a} : ${scoreboard.b} ${pokemonB.name}${
								scoreboard.draw > 0
									? ` (${scoreboard.draw} draw${scoreboard.draw > 1 ? "s" : ""})`
									: ""
							}`}
						>
							<span className="battle-scoreboard-score" style={{ color: colorA }}>
								{scoreboard.a}
							</span>
							<span className="battle-scoreboard-sep" />
							<span className="battle-scoreboard-score" style={{ color: colorB }}>
								{scoreboard.b}
							</span>
							{scoreboard.draw > 0 && (
								<>
									<span className="battle-scoreboard-sep is-muted" />
									<span className="battle-scoreboard-draw">{scoreboard.draw}</span>
								</>
							)}
						</div>
					)}

					<div className="battle-info-wrap" ref={infoWrapRef}>
						<button
							className="battle-info-btn"
							onClick={() => setShowInfo((v) => !v)}
							aria-label="How is damage calculated?"
							title="How is damage calculated?"
						>
							<MdInfoOutline size={18} />
						</button>
						{showInfo && <BattleInfoPopover onClose={() => setShowInfo(false)} />}
					</div>

					<div className="battle-stage">
						<BattleFighter
							side="a"
							pokemon={pokemonA}
							color={colorA}
							isActing={activeSide === "a"}
							isHit={hitSide === "a"}
							isFainted={battle.winner === "b" && isRevealed}
							revealCount={revealCount}
						/>

						<span className="battle-stage-vs">VS</span>

						<BattleFighter
							side="b"
							pokemon={pokemonB}
							color={colorB}
							isActing={activeSide === "b"}
							isHit={hitSide === "b"}
							isFainted={battle.winner === "a" && isRevealed}
							revealCount={revealCount}
						/>
					</div>

					<div className="battle-hp-row">
						<BattleHpBar name={pokemonA.name} hp={currentHpA} maxHp={battle.maxHpA} />
						<BattleHpBar name={pokemonB.name} hp={currentHpB} maxHp={battle.maxHpB} />
					</div>

					<div className="battle-log-scroll" ref={logRef}>
						<ul className="battle-chat">
							{chatEntries.map((entry, i) => (
								<BattleChatEntry
									key={i}
									entry={entry}
									isLatest={i === chatEntries.length - 1}
									pokemon={entry.side === "a" ? pokemonA : pokemonB}
									color={entry.side === "a" ? colorA : colorB}
								/>
							))}
						</ul>

						{winnerPokemon && (
							<BattleWinnerBanner
								pokemon={winnerPokemon}
								color={winnerColor}
								confettiBurst={confettiBurst}
								onCelebrateAgain={() => setConfettiBurst((c) => c + 1)}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default BattleArena
