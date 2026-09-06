import { Link, useSearchParams } from "react-router"
import { getTypeColor } from "../constants/typeColors"
import { STAT_LABELS } from "../constants/statLabels"
import TypeIcon, { CompareIcon } from "../components/TypeIcon"

const STAT_BAR_MAX = 200

const getStat = (pokemon, statName) =>
	pokemon.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0

const getTotalStats = (pokemon) =>
	pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const CompareStatRow = ({ label, rawA, rawB, max, isTotal = false }) => {
	const scale = max ?? Math.max(rawA, rawB, 1) * 1.1
	const pctA = Math.min((rawA / scale) * 100, 100)
	const pctB = Math.min((rawB / scale) * 100, 100)
	const aWins = rawA > rawB
	const bWins = rawB > rawA

	return (
		<div className={`compare-stat-row${isTotal ? " is-total" : ""}`}>
			<span
				className={`compare-stat-value${aWins ? " is-winner" : ""}`}
			>
				{rawA}
			</span>

			<div className="compare-stat-track">
				<div
					className={`compare-stat-bar side-a${aWins ? " is-winner" : ""}`}
					style={{ width: `${pctA}%` }}
				/>
				<span className="compare-stat-label">{label}</span>
				<div
					className={`compare-stat-bar side-b${bWins ? " is-winner" : ""}`}
					style={{ width: `${pctB}%` }}
				/>
			</div>

			<span
				className={`compare-stat-value${bWins ? " is-winner" : ""}`}
			>
				{rawB}
			</span>
		</div>
	)
}

const ComparePicker = ({ pokemonList, side, value, onChange }) => (
	<select
		className="compare-select"
		value={value}
		onChange={(e) => onChange(side, e.target.value)}
	>
		<option value="">Pick a pokemon…</option>
		{pokemonList.map((p) => (
			<option key={p.name} value={p.name}>
				#{String(p.id).padStart(3, "0")} {capitalize(p.name)}
			</option>
		))}
	</select>
)

const CompareHead = ({ pokemon }) => {
	const color = getTypeColor(pokemon.types?.[0]?.type?.name)

	return (
		<Link
			to={`/pokemon/${pokemon.name}`}
			className="compare-head"
			style={{ backgroundColor: color }}
		>
			<img src={pokemon.image} alt={pokemon.name} />
			<p className="compare-head-id">#{String(pokemon.id).padStart(3, "0")}</p>
			<p className="compare-head-name">{pokemon.name}</p>
			<div className="type-badge-row">
				{pokemon.types.map(({ type }) => (
					<span key={type.name} className="type-badge">
						<TypeIcon type={type.name} size={12} />
						{type.name}
					</span>
				))}
			</div>
		</Link>
	)
}

const ComparePage = ({ pokemonList }) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const nameA = searchParams.get("a") ?? ""
	const nameB = searchParams.get("b") ?? ""

	const pokemonA = pokemonList.find((p) => p.name === nameA)
	const pokemonB = pokemonList.find((p) => p.name === nameB)

	const handleSelect = (side, value) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)
			if (value) next.set(side, value)
			else next.delete(side)
			return next
		})
	}

	const handleSwap = () => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)
			const a = prev.get("a")
			const b = prev.get("b")

			if (a) next.set("b", a)
			else next.delete("b")
			if (b) next.set("a", b)
			else next.delete("a")

			return next
		})
	}

	return (
		<div className="compare-page">
			<h1 className="page-title">Compare</h1>

			<div className="compare-picker">
				<ComparePicker
					pokemonList={pokemonList}
					side="a"
					value={nameA}
					onChange={handleSelect}
				/>
				<button
					className="compare-swap-btn"
					onClick={handleSwap}
					disabled={!nameA && !nameB}
					aria-label="Swap pokemon"
					title="Swap"
				>
					<CompareIcon size={20} />
				</button>
				<ComparePicker
					pokemonList={pokemonList}
					side="b"
					value={nameB}
					onChange={handleSelect}
				/>
			</div>

			{!pokemonA || !pokemonB ? (
				<p className="status-message">Pick two pokemon to compare.</p>
			) : (
				<div className="compare-result">
					<div className="compare-heads">
						<CompareHead pokemon={pokemonA} />
						<span className="compare-vs">VS</span>
						<CompareHead pokemon={pokemonB} />
					</div>

					<div className="compare-stats">
						<CompareStatRow
							label="Height (m)"
							rawA={pokemonA.height / 10}
							rawB={pokemonB.height / 10}
						/>
						<CompareStatRow
							label="Weight (kg)"
							rawA={pokemonA.weight / 10}
							rawB={pokemonB.weight / 10}
						/>

						{Object.entries(STAT_LABELS).map(([statName, label]) => (
							<CompareStatRow
								key={statName}
								label={label}
								rawA={getStat(pokemonA, statName)}
								rawB={getStat(pokemonB, statName)}
								max={STAT_BAR_MAX}
							/>
						))}

						<CompareStatRow
							label="Total"
							rawA={getTotalStats(pokemonA)}
							rawB={getTotalStats(pokemonB)}
							isTotal
						/>
					</div>
				</div>
			)}
		</div>
	)
}

export default ComparePage
