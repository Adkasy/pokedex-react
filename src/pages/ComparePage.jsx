import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { MdShuffle } from "react-icons/md"
import { getPrimaryTypeColor, getPrimaryCardColor } from "../constants/typeColors"
import { STAT_LABELS, STAT_BAR_MAX } from "../constants/statLabels"
import { getStat, getTotalStats } from "../utils/pokemonStats"
import { TypeBadge, CompareIcon } from "../components/TypeIcon"
import PokemonPicker from "../components/PokemonPicker"
import BattleArena from "../components/BattleArena"
import PokemonImage from "../components/PokemonImage"
import LoadingSpinner from "../components/LoadingSpinner"
import { usePokemonStore } from "../store/usePokemonStore"

const CompareStatRow = ({ label, rawA, rawB, max, isTotal = false }) => {
	const scale = max ?? Math.max(rawA, rawB, 1) * 1.1
	const pctA = Math.min((rawA / scale) * 100, 100)
	const pctB = Math.min((rawB / scale) * 100, 100)
	const aWins = rawA > rawB
	const bWins = rawB > rawA

	// bar-nya mulai dari lebar 0%, baru "ngisi" ke lebar aslinya abis
	// render pertama — 2x requestAnimationFrame biar browser sempet
	// commit state 0%-nya dulu sebelum ke-transition ke lebar final,
	// kalau cuma 1x kadang keburu digabung jadi 1 paint & animasinya
	// gak kelihatan sama sekali
	const [filled, setFilled] = useState(false)
	useEffect(() => {
		let raf2
		const raf1 = requestAnimationFrame(() => {
			raf2 = requestAnimationFrame(() => setFilled(true))
		})
		return () => {
			cancelAnimationFrame(raf1)
			cancelAnimationFrame(raf2)
		}
	}, [])

	return (
		<div className={`compare-stat-row${isTotal ? " is-total" : ""}`}>
			<span className={`compare-stat-value${aWins ? " is-winner" : ""}`}>{rawA}</span>

			<div className="compare-stat-track">
				<div
					className={`compare-stat-bar side-a${aWins ? " is-winner" : ""}`}
					style={{ width: filled ? `${pctA}%` : "0%" }}
				/>
				<span className="compare-stat-label">{label}</span>
				<div
					className={`compare-stat-bar side-b${bWins ? " is-winner" : ""}`}
					style={{ width: filled ? `${pctB}%` : "0%" }}
				/>
			</div>

			<span className={`compare-stat-value${bWins ? " is-winner" : ""}`}>{rawB}</span>
		</div>
	)
}

const CompareHead = ({ pokemon, isStrongerTotal = false }) => {
	// palette soft/pastel, bukan yang vivid — liat comment CARD_COLORS di
	// typeColors.js buat alasannya
	const color = getPrimaryCardColor(pokemon.types)

	return (
		<Link to={`/pokemon/${pokemon.name}`} className="compare-head" style={{ backgroundColor: color }}>
			{isStrongerTotal && (
				<span className="compare-head-edge-badge" title="Higher total base stats">
					Higher Total
				</span>
			)}
			<PokemonImage className="compare-head-image" src={pokemon.image} alt={pokemon.name} fallbackIconSize={100} />
			<p className="compare-head-id">#{String(pokemon.id).padStart(3, "0")}</p>
			<p className="compare-head-name">{pokemon.name}</p>
			<div className="type-badge-row">
				{pokemon.types.map(({ type }) => (
					<TypeBadge key={type.name} type={type.name} />
				))}
			</div>
		</Link>
	)
}

// heads + stat bars + battle arena — cuma dirender begitu pokemonA/B
// keduanya udah ke-load, jadi di-component-in sendiri biar bisa itung
// color/total sekali di sini (bukan berkali-kali kesebar di ComparePage)
const CompareResult = ({ pokemonA, pokemonB }) => {
	const colorA = getPrimaryTypeColor(pokemonA.types)
	const colorB = getPrimaryTypeColor(pokemonB.types)
	const totalA = getTotalStats(pokemonA)
	const totalB = getTotalStats(pokemonB)

	return (
		<div className="compare-result">
			<div className="compare-heads">
				<CompareHead pokemon={pokemonA} isStrongerTotal={totalA > totalB} />
				<span
					className="compare-vs"
					style={{ "--vs-color-a": colorA, "--vs-color-b": colorB }}
				>
					VS
				</span>
				<CompareHead pokemon={pokemonB} isStrongerTotal={totalB > totalA} />
			</div>

			<div className="compare-stats">
				<CompareStatRow label="Height (m)" rawA={pokemonA.height / 10} rawB={pokemonB.height / 10} />
				<CompareStatRow label="Weight (kg)" rawA={pokemonA.weight / 10} rawB={pokemonB.weight / 10} />

				<div className="compare-stats-divider" role="separator" />

				{Object.entries(STAT_LABELS).map(([statName, label]) => (
					<CompareStatRow
						key={statName}
						label={label}
						rawA={getStat(pokemonA, statName)}
						rawB={getStat(pokemonB, statName)}
						max={STAT_BAR_MAX}
					/>
				))}

				<CompareStatRow label="Total" rawA={totalA} rawB={totalB} isTotal />
			</div>

			<BattleArena
				key={`${pokemonA.name}-${pokemonB.name}`}
				pokemonA={pokemonA}
				pokemonB={pokemonB}
			/>
		</div>
	)
}

// Halaman Compare. Alur datanya:
// - `index` (semua Pokemon, ringan) dateng dari App.jsx lewat props,
//   dipake buat isi 2 dropdown PokemonPicker & buat "Random Matchup"
// - 2 Pokemon yang lagi dipilih DISIMPEN DI URL (?a=...&b=...), bukan
//   useState — biar hasil compare-nya bisa di-share/refresh
// - begitu ada nama kepilih, detail lengkapnya (stats, types, dll)
//   di-fetch dari store (usePokemonStore) — sama persis kaya PokemonGridPage
// - kalo dua-duanya udah ke-fetch, semuanya diserahin ke <CompareResult>
//   (component di atas) yang ngurus tampilan head-to-head + battle arena
const ComparePage = ({ index }) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const nameA = searchParams.get("a") ?? ""
	const nameB = searchParams.get("b") ?? ""

	const detailsByName = usePokemonStore((state) => state.detailsByName)
	const ensureDetails = usePokemonStore((state) => state.ensureDetails)

	// picker & random matchup cuma butuh index ringan (nama/id/gambar);
	// detail lengkap (stats, types, dll) buat 2 yang lagi dipilih baru
	// di-fetch di sini
	useEffect(() => {
		const names = [nameA, nameB].filter(Boolean)
		if (names.length > 0) ensureDetails(names)
	}, [nameA, nameB, ensureDetails])

	const pokemonA = detailsByName[nameA]
	const pokemonB = detailsByName[nameB]

	const handleSelect = (side, value) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)
			if (value) next.set(side, value)
			else next.delete(side)
			return next
		})
	}

	const handleSurprise = () => {
		if (index.length < 2) return

		const i = Math.floor(Math.random() * index.length)
		let j = Math.floor(Math.random() * index.length)
		while (j === i) j = Math.floor(Math.random() * index.length)

		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)
			next.set("a", index[i].name)
			next.set("b", index[j].name)
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
				<PokemonPicker pokemonList={index} value={nameA} onChange={(name) => handleSelect("a", name)} />
				<button
					className="compare-swap-btn"
					onClick={handleSwap}
					disabled={!nameA && !nameB}
					aria-label="Swap pokemon"
					title="Swap"
				>
					<CompareIcon size={20} />
				</button>
				<PokemonPicker pokemonList={index} value={nameB} onChange={(name) => handleSelect("b", name)} />
			</div>

			<button className="btn compare-surprise-btn" onClick={handleSurprise} title="Random matchup">
				<MdShuffle className="compare-surprise-icon" size={14} />
				Random Matchup
			</button>

			{!nameA || !nameB ? (
				<p className="status-message">Pick two pokemon to compare.</p>
			) : !pokemonA || !pokemonB ? (
				<LoadingSpinner />
			) : (
				<CompareResult pokemonA={pokemonA} pokemonB={pokemonB} />
			)}
		</div>
	)
}

export default ComparePage
