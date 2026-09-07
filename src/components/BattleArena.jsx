import { useEffect, useRef, useState } from "react"
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
	const [battle, setBattle] = useState(null) // { log, maxHpA, maxHpB }
	const [revealCount, setRevealCount] = useState(0)
	const logRef = useRef(null)

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
			behavior: "smooth",
		})
	}, [revealCount])

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

	return (
		<div className="battle-section">
			<button
				className="btn btn-primary battle-simulate-btn"
				onClick={handleSimulate}
				disabled={isSimulating}
			>
				{isSimulating
					? "Simulating…"
					: battle
						? "⚔️ Simulate Again"
						: "⚔️ Simulate Battle"}
			</button>

			{battle && (
				<div className="battle-arena">
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

					<ul className="battle-log" ref={logRef}>
						{visibleLog.map((entry, i) => (
							<li
								key={i}
								className={`battle-log-entry battle-log-${entry.type}`}
							>
								{entry.text}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default BattleArena
