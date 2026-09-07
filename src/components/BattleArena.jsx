import { useEffect, useRef, useState } from "react"
import { GiCrossedSwords, GiTrophy } from "react-icons/gi"
import { MdInfoOutline, MdClose } from "react-icons/md"
import { simulateBattle } from "../utils/battleSimulator"
import { getTypeColor } from "../constants/typeColors"
import { playVictorySound } from "../utils/sound"

const REVEAL_DELAY_MS = 700

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

const BattleArena = ({ pokemonA, pokemonB }) => {
	const [battle, setBattle] = useState(null) // { log, maxHpA, maxHpB, winner }
	const [revealCount, setRevealCount] = useState(0)
	const [showInfo, setShowInfo] = useState(false)
	const logRef = useRef(null)
	const arenaRef = useRef(null)
	const infoWrapRef = useRef(null)
	const colorA = getTypeColor(pokemonA.types?.[0]?.type?.name)
	const colorB = getTypeColor(pokemonB.types?.[0]?.type?.name)

	useEffect(() => {
		if (!battle || revealCount >= battle.log.length) return

		const timer = setTimeout(() => {
			setRevealCount((c) => c + 1)
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
	}

	const visibleLog = battle ? battle.log.slice(0, revealCount) : []
	const latest = visibleLog[visibleLog.length - 1]
	const currentHpA = latest ? latest.hpA : (battle?.maxHpA ?? 0)
	const currentHpB = latest ? latest.hpB : (battle?.maxHpB ?? 0)

	const activeSide =
		latest?.type === "attack" || latest?.type === "faint" ? latest.side : null
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

	return (
		<div className="battle-section">
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
				<div className="battle-arena" ref={arenaRef}>
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

								<code className="battle-info-formula">
									<span className="f-damage">Damage</span> ={" "}
									<span className="f-atk">Attack</span> ÷{" "}
									<span className="f-def">Defense</span> ×{" "}
									<span className="f-type">Type Effectiveness</span> ×{" "}
									<span className="f-luck">Luck</span>
								</code>

								<ul className="battle-info-list">
									<li>
										<code>Attack ÷ Defense</code>: the attacker&rsquo;s
										Attack against the target&rsquo;s Defense. Higher
										Attack (or a weaker target Defense) means more damage.
									</li>
									<li>
										<code>Type Effectiveness</code>: follows the same type
										chart as the games. e.g. Water beats Fire, Fire beats
										Grass, Grass beats Water. A super effective hit does
										more damage, a resisted hit does less.
									</li>
									<li>
										<code>Luck</code>: a small random swing (85% to 100%),
										so a rematch won&rsquo;t always go the same way.
									</li>
								</ul>

								<p className="battle-info-example">
									Example: Charizard is Fire-type, Blastoise is Water-type.
									Water resists Fire, so when Charizard attacks, its Type
									Effectiveness is weak, and the hit only lands for about 7
									to 8 damage instead of the usual amount.
								</p>
							</div>
						)}
					</div>

					<div className="battle-stage">
						<div
							className={`battle-fighter side-a${activeSide === "a" ? " is-acting" : ""}${
								battle.winner === "b" && isRevealed ? " is-fainted" : ""
							}`}
						>
							<img src={pokemonA.image} alt={pokemonA.name} />
						</div>

						<span className="battle-stage-vs">VS</span>

						<div
							className={`battle-fighter side-b${activeSide === "b" ? " is-acting" : ""}${
								battle.winner === "a" && isRevealed ? " is-fainted" : ""
							}`}
						>
							<img src={pokemonB.image} alt={pokemonB.name} />
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
										<img
											className="battle-chat-avatar"
											src={entry.side === "a" ? pokemonA.image : pokemonB.image}
											alt=""
										/>
										<div
											className="battle-chat-bubble"
											style={{
												backgroundColor: entry.side === "a" ? colorA : colorB,
											}}
										>
											{entry.text}
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
								<img
									className="battle-winner-image"
									src={winnerPokemon.image}
									alt={winnerPokemon.name}
								/>
								<div className="battle-winner-ribbon">
									<GiTrophy size={16} />
									{winnerPokemon.name} wins!
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default BattleArena
