import { useEffect, useRef, useState } from "react"
import { GiCrossedSwords, GiTrophy } from "react-icons/gi"
import { simulateBattle } from "../utils/battleSimulator"

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
					{Math.max(0, Math.round(hp))} / {maxHp}
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
	const logRef = useRef(null)
	const arenaRef = useRef(null)

	useEffect(() => {
		if (!battle || revealCount >= battle.log.length) return

		const timer = setTimeout(() => {
			setRevealCount((c) => c + 1)
		}, REVEAL_DELAY_MS)

		return () => clearTimeout(timer)
	}, [battle, revealCount])

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
		if (!battle) return
		arenaRef.current?.scrollIntoView({ behavior: "auto", block: "start" })
	}, [battle])

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

					<ul className="battle-chat" ref={logRef}>
						{chatEntries.map((entry, i) =>
							entry.type === "attack" ? (
								<li key={i} className={`battle-chat-row side-${entry.side}`}>
									<img
										className="battle-chat-avatar"
										src={entry.side === "a" ? pokemonA.image : pokemonB.image}
										alt=""
									/>
									<div className="battle-chat-bubble">{entry.text}</div>
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
			)}
		</div>
	)
}

export default BattleArena
