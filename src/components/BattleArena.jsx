import { useEffect, useRef, useState } from "react"
import { GiCrossedSwords, GiTrophy } from "react-icons/gi"
import { MdInfoOutline, MdClose } from "react-icons/md"
import { simulateBattle } from "../utils/battleSimulator"
import { getTypeColor } from "../constants/typeColors"
import { playVictorySound, playBattleStartSound } from "../utils/sound"
import PokemonImage from "./PokemonImage"

const REVEAL_DELAY_MS = 500
const BATTLE_BEGIN_MS = 950

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

const CONFETTI_COLORS = ["#ff6b57", "#5b9dff", "#34d399", "#fbbf24", "#e879f9"]
const CONFETTI_COUNT = 70

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

const BattleArena = ({ pokemonA, pokemonB }) => {
	const [battle, setBattle] = useState(null) // { log, maxHpA, maxHpB, winner }
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
	const colorA = getTypeColor(pokemonA.types?.[0]?.type?.name)
	const colorB = getTypeColor(pokemonB.types?.[0]?.type?.name)

	useEffect(() => {
		if (!battle || revealCount >= battle.log.length) return

		const timer = setTimeout(() => {
			const nextCount = revealCount + 1
			setRevealCount(nextCount)

			// battle baru aja kelar kereveal semua — sekalian catet
			// skornya di sini (di dalem callback, bukan langsung di body
			// effect) sekali doang buat battle ini
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
		logRef.current?.scrollTo({
			top: logRef.current.scrollHeight,
			behavior: "auto",
		})
	}, [revealCount])

	useEffect(() => {
		// useEffect udah jalan SETELAH React commit DOM-nya, jadi
		// arenaRef.current di sini udah pasti ke-render & posisinya
		// akurat — gak perlu nunggu requestAnimationFrame segala (itu
		// malah bisa gak jalan kalau tab/pane lagi background/hidden).
		// Tinggi arena-nya sendiri KONSTAN sepanjang battle (chat log
		// scroll di dalem kontainer fix-height-nya sendiri), jadi cukup
		// fokus SEKALI di sini — gak perlu di-scroll ulang lagi nanti.
		if (!battle) return
		arenaRef.current?.scrollIntoView({ behavior: "auto", block: "start" })
	}, [battle])

	useEffect(() => {
		if (!showInfo) return

		// klik di mana pun di luar popover/tombolnya bakal nutup popover-nya
		const handleClickOutside = (e) => {
			if (!infoWrapRef.current?.contains(e.target)) {
				setShowInfo(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [showInfo])

	const isSimulating = battle && revealCount < battle.log.length

	const handleSimulate = () => {
		const result = simulateBattle(pokemonA, pokemonB)
		setBattle(result)
		setRevealCount(0)
		setShowBattleBegin(true)
		playBattleStartSound()
	}

	useEffect(() => {
		if (!showBattleBegin) return
		const timer = setTimeout(() => setShowBattleBegin(false), BATTLE_BEGIN_MS)
		return () => clearTimeout(timer)
	}, [showBattleBegin])

	const visibleLog = battle ? battle.log.slice(0, revealCount) : []
	const latest = visibleLog[visibleLog.length - 1]
	// ngikutin round entry yang paling baru ke-reveal — jadi kelihatan
	// "real-time" nambah bareng jalannya pertarungan, bukan cuma angka
	// akhir yang muncul sekaligus
	const currentRound = latest?.round ?? 1
	const currentHpA = latest ? latest.hpA : (battle?.maxHpA ?? 0)
	const currentHpB = latest ? latest.hpB : (battle?.maxHpB ?? 0)

	const activeSide =
		latest?.type === "attack" || latest?.type === "faint" ? latest.side : null
	// kena buat 1 tick reveal doang (700ms) — pas berikutnya latest udah
	// pindah ke entry lain jadi shake/flash-nya otomatis berhenti sendiri
	const isSuperHit = latest?.type === "attack" && latest.isSuperEffective
	const isRevealed = battle && revealCount >= battle.log.length
	const winnerPokemon =
		isRevealed && battle.winner === "a"
			? pokemonA
			: isRevealed && battle.winner === "b"
				? pokemonB
				: null

	useEffect(() => {
		if (winnerPokemon) playVictorySound()
	}, [winnerPokemon])

	// "result" gak ditampilin di chat — udah ada banner winner-nya sendiri
	const chatEntries = visibleLog.filter((entry) => entry.type !== "result")

	// nekenin "N damage"-nya jadi chip kecil di dalem bubble-nya, bukan
	// cuma nyempil di tengah kalimat kayak teks biasa
	const renderAttackText = (entry) => {
		const marker = `${entry.damage} damage`
		const idx = entry.text.indexOf(marker)
		if (idx === -1) return entry.text

		return (
			<>
				{entry.text.slice(0, idx)}
				<span
					className={`battle-damage-chip${
						entry.isSuperEffective ? " is-super" : ""
					}`}
				>
					{entry.damage} damage
				</span>
				{entry.text.slice(idx + marker.length)}
			</>
		)
	}

	return (
		<div className="battle-section">
			{showBattleBegin && <BattleBeginOverlay />}

			<button
				className="btn btn-primary battle-simulate-btn"
				onClick={handleSimulate}
				disabled={isSimulating}
			>
				<GiCrossedSwords size={18} />
				{isSimulating
					? "Simulating…"
					: battle
						? "Simulate Again"
						: "Simulate Battle"}
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
						<div className="battle-scoreboard">
							<span className="battle-scoreboard-name">{pokemonA.name}</span>
							<span className="battle-scoreboard-score">{scoreboard.a}</span>
							<span className="battle-scoreboard-sep">:</span>
							<span className="battle-scoreboard-score">{scoreboard.b}</span>
							<span className="battle-scoreboard-name">{pokemonB.name}</span>
							{scoreboard.draw > 0 && (
								<span className="battle-scoreboard-draw">
									({scoreboard.draw} draw
									{scoreboard.draw > 1 ? "s" : ""})
								</span>
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

						{showInfo && (
							<div className="battle-info-popover">
								<div className="battle-info-header">
									<p className="battle-info-title">How damage works</p>
									<button
										className="battle-info-close"
										onClick={() => setShowInfo(false)}
										aria-label="Close"
									>
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
									<code className="f-chip f-chip-type">
										Type Effectiveness
									</code>
									<span className="f-op">×</span>
									<code className="f-chip f-chip-luck">Luck</code>
								</div>

								<ul className="battle-info-list">
									<li>
										<code className="f-chip f-chip-atk">
											Attack <span className="f-op-inline">÷</span> Defense
										</code>
										: the attacker&rsquo;s Attack against the target&rsquo;s
										Defense. Higher Attack (or a weaker target Defense)
										means more damage.
									</li>
									<li>
										<code className="f-chip f-chip-type">
											Type Effectiveness
										</code>
										: follows the same type chart as the games. e.g. Water
										beats Fire, Fire beats Grass, Grass beats Water. A super
										effective hit does more damage, a resisted hit does
										less.
									</li>
									<li>
										<code className="f-chip f-chip-luck">Luck</code>: a
										small random swing (75% to 100%), so a rematch
										won&rsquo;t always go the same way.
									</li>
								</ul>

								<p className="battle-info-example">
									<strong className="battle-info-example-label">
										Example:
									</strong>{" "}
									Charizard is Fire-type, Blastoise is Water-type. Water
									resists Fire, so when Charizard attacks, its Type
									Effectiveness is weak, and the hit only lands for about 7
									to 8 damage instead of the usual amount.
								</p>

								<p className="battle-info-subheading">Other battle rules</p>

								<ul className="battle-info-list">
									<li>
										<code className="f-chip f-chip-crit">Critical Hit</code>
										: on top of all that, every attack also has a small 10%
										chance to land a critical hit for 1.5 × extra damage.
									</li>
									<li>
										<code className="f-chip f-chip-neutral">30 Rounds</code>: if
										neither Pokémon has fainted by round 30, the battle ends
										in a draw instead of dragging on forever.
									</li>
								</ul>
							</div>
						)}
					</div>

					<div className="battle-stage">
						<div
							className={`battle-fighter side-a${activeSide === "a" ? " is-acting" : ""}${
								battle.winner === "b" && isRevealed ? " is-fainted" : ""
							}`}
						>
							<PokemonImage
								className="battle-fighter-image"
								src={pokemonA.image}
								alt={pokemonA.name}
								iconSize={85}
							/>
						</div>

						<span className="battle-stage-vs">VS</span>

						<div
							className={`battle-fighter side-b${activeSide === "b" ? " is-acting" : ""}${
								battle.winner === "a" && isRevealed ? " is-fainted" : ""
							}`}
						>
							<PokemonImage
								className="battle-fighter-image"
								src={pokemonB.image}
								alt={pokemonB.name}
								iconSize={85}
							/>
						</div>
					</div>

					<div className="battle-hp-row">
						<BattleHpBar
							name={pokemonA.name}
							hp={currentHpA}
							maxHp={battle.maxHpA}
						/>
						<BattleHpBar
							name={pokemonB.name}
							hp={currentHpB}
							maxHp={battle.maxHpB}
						/>
					</div>

					<div className="battle-log-scroll" ref={logRef}>
						<ul className="battle-chat">
							{chatEntries.map((entry, i) =>
								entry.type === "attack" ? (
									<li key={i} className={`battle-chat-row side-${entry.side}`}>
										<PokemonImage
											className="battle-chat-avatar"
											src={entry.side === "a" ? pokemonA.image : pokemonB.image}
											iconSize={62}
										/>
										<div
											className={`battle-chat-bubble${entry.isCrit ? " is-crit" : ""}`}
											style={{
												backgroundColor: entry.side === "a" ? colorA : colorB,
											}}
										>
											{entry.isCrit && (
												<span className="battle-crit-badge">💥 Critical Hit</span>
											)}
											{renderAttackText(entry)}
										</div>
									</li>
								) : (
									<li key={i} className="battle-chat-system">
										{entry.text}
									</li>
								),
							)}
						</ul>

						{winnerPokemon && (
							<div className="battle-winner">
								<Confetti key={confettiBurst} />
								<PokemonImage
									className="battle-winner-image"
									src={winnerPokemon.image}
									alt={winnerPokemon.name}
									iconSize={160}
								/>
								<button
									className="battle-winner-ribbon"
									onClick={() => setConfettiBurst((c) => c + 1)}
									title="Celebrate again!"
								>
									<GiTrophy size={16} />
									{winnerPokemon.name} wins!
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default BattleArena
