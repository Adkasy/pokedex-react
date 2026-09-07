import { Fragment, useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import {
	MdChevronLeft,
	MdChevronRight,
	MdKeyboardArrowDown,
	MdAutoAwesome,
} from "react-icons/md"
import { getTypeColor, hexToRgba } from "../constants/typeColors"
import { useFavoriteStore } from "../store/useFavoriteStore"
import { usePokemonStore } from "../store/usePokemonStore"
import { useCryPlayerStore } from "../store/useCryPlayerStore"
import TypeIcon, {
	StarIcon,
	PokeballIcon,
	HumanIcon,
	PlayIcon,
	WaveformIcon,
} from "../components/TypeIcon"
import PokemonImage from "../components/PokemonImage"
import LoadingSpinner from "../components/LoadingSpinner"
import { playFavoriteSound } from "../utils/sound"
import {
	getPokemonSpecies,
	getEvolutionChain,
	getAbilityDetail,
} from "../api/pokeapi"
import { flattenEvolutionChain, cleanFlavorText } from "../utils/evolution"
import {
	getCatchDifficulty,
	getSizeComparisonLabel,
	AVERAGE_HUMAN_HEIGHT_M,
} from "../utils/pokedexFacts"
import { STAT_LABELS } from "../constants/statLabels"
import { TYPE_COLORS } from "../constants/typeColors"
import { getTypeMultiplier } from "../constants/typeChart"
import { formatGeneration } from "../utils/text"

const STAT_BAR_MAX = 200
const MOVES_PREVIEW_COUNT = 24

const PokemonDetailPage = ({ index }) => {
	const { name } = useParams()
	const navigate = useNavigate()
	const detailsByName = usePokemonStore((state) => state.detailsByName)
	const ensureDetails = usePokemonStore((state) => state.ensureDetails)
	const pokemon = detailsByName[name]
	// index-nya udah kepastian ke-load duluan sama App sebelum route ini
	// dirender, jadi kalau namanya gak ada di situ, berarti emang gak
	// ada Pokemon-nya (bukan lagi loading)
	const existsInIndex = index.some((item) => item.name === name)
	const addFavorite = useFavoriteStore((state) => state.addFavorite)
	const removeFavorite = useFavoriteStore((state) => state.removeFavorite)
	const isFavorite = useFavoriteStore((state) =>
		pokemon ? state.favorites.some((f) => f.id === pokemon.id) : false,
	)
	const isPlayingCry = useCryPlayerStore(
		(state) => !!pokemon && state.playingId === pokemon.id,
	)
	const playCry = useCryPlayerStore((state) => state.playCry)
	const [species, setSpecies] = useState(null)
	const [evolutionStages, setEvolutionStages] = useState([])
	const [abilityDetails, setAbilityDetails] = useState({})
	const [showAllMoves, setShowAllMoves] = useState(false)
	// nyimpen `name` yang "udah dilihat" render sebelumnya — dipake buat
	// reset showAllMoves ke collapsed tiap ganti Pokemon TANPA effect
	// (component-nya gak remount pas cuma parameter :name yang berubah),
	// sesuai pattern "adjusting state on a prop change" dari React docs
	const [prevName, setPrevName] = useState(name)

	if (name !== prevName) {
		setPrevName(name)
		setShowAllMoves(false)
	}

	// prev/next Pokemon ngikutin urutan index (yang ngikutin urutan id
	// dari PokeAPI) — bukan berdasarkan urutan generation/dex khusus.
	// Dihitung dari `index`+`name` doang (bukan `pokemon`), jadi bisa
	// dipake di useEffect keyboard di bawah sebelum early-return
	const currentIndexPos = index.findIndex((item) => item.name === name)
	const prevPokemon = currentIndexPos > 0 ? index[currentIndexPos - 1] : null
	const nextPokemon =
		currentIndexPos !== -1 && currentIndexPos < index.length - 1
			? index[currentIndexPos + 1]
			: null

	useEffect(() => {
		ensureDetails([name])
	}, [name, ensureDetails])

	// panah kiri/kanan keyboard = pindah ke Pokemon sebelumnya/berikutnya,
	// kecuali user lagi ngetik di input/textarea (misal search bar)
	useEffect(() => {
		const handleKeyDown = (e) => {
			const tag = e.target?.tagName
			if (tag === "INPUT" || tag === "TEXTAREA") return

			if (e.key === "ArrowLeft" && prevPokemon) {
				navigate(`/pokemon/${prevPokemon.name}`)
			} else if (e.key === "ArrowRight" && nextPokemon) {
				navigate(`/pokemon/${nextPokemon.name}`)
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [prevPokemon, nextPokemon, navigate])

	useEffect(() => {
		if (!pokemon) return

		let cancelled = false

		const fetchExtra = async () => {
			try {
				const speciesData = await getPokemonSpecies(pokemon.name)
				const chainData = await getEvolutionChain(
					speciesData.evolution_chain.url,
				)

				if (cancelled) return

				setSpecies(speciesData)
				setEvolutionStages(flattenEvolutionChain(chainData.chain))
			} catch {
				// species/evolution data is a nice-to-have, not critical —
				// fail silently and just don't show those sections
			}
		}

		fetchExtra()

		return () => {
			cancelled = true
		}
	}, [pokemon])

	// deskripsi efek tiap ability — di-fetch on-demand per ability yang
	// belum ada, digabung ke cache lama (bukan ditimpa) jadi ability yang
	// sama dipake Pokemon lain gak perlu di-fetch ulang
	useEffect(() => {
		if (!pokemon) return

		let cancelled = false

		const fetchAbilities = async () => {
			const missing = pokemon.abilities.filter(
				(a) => !abilityDetails[a.ability.name],
			)
			if (missing.length === 0) return

			try {
				const results = await Promise.all(
					missing.map((a) => getAbilityDetail(a.ability.name)),
				)

				if (cancelled) return

				setAbilityDetails((prev) => {
					const next = { ...prev }
					results.forEach((detail) => {
						next[detail.name] = detail
					})
					return next
				})
			} catch {
				// ability detail juga nice-to-have — biarin section-nya
				// nunjukin nama abilitynya doang tanpa deskripsi
			}
		}

		fetchAbilities()

		return () => {
			cancelled = true
		}
		// `abilityDetails` sengaja gak dimasukin ke deps — efek ini sendiri
		// yang nge-update state itu, dimasukin bakal infinite-loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pokemon])

	if (!pokemon) {
		return existsInIndex ? (
			<LoadingSpinner />
		) : (
			<p className="status-message">Pokemon not found.</p>
		)
	}

	const primaryColor = getTypeColor(pokemon.types?.[0]?.type?.name)

	const genus = species?.genera.find((g) => g.language.name === "en")?.genus
	const flavorTextEntry = species?.flavor_text_entries.find(
		(f) => f.language.name === "en",
	)
	const evolvesFromName = species?.evolves_from_species?.name
	const evolvesFromMatch = index.find(
		(item) => item.name === evolvesFromName,
	)
	const catchDifficulty = getCatchDifficulty(species?.capture_rate)
	const pokemonHeightM = pokemon.height / 10

	// type yang efektif >1x ke gabungan type Pokemon ini — dihitung dari
	// type chart yang sama kayak yang dipake battle simulator, jadi gak
	// perlu fetch tambahan buat ini
	const defenderTypes = pokemon.types.map((t) => t.type.name)
	const weaknesses = Object.keys(TYPE_COLORS).filter(
		(attackType) => getTypeMultiplier(attackType, defenderTypes) > 1,
	)

	const moveNames = [...new Set(pokemon.moves.map((m) => m.move.name))].sort()
	const visibleMoves = showAllMoves
		? moveNames
		: moveNames.slice(0, MOVES_PREVIEW_COUNT)

	// gender_rate itu "per delapan female" (0-8), -1 artinya genderless
	const femaleMalePct = {
		female: ((species?.gender_rate ?? 0) / 8) * 100,
		male: 100 - ((species?.gender_rate ?? 0) / 8) * 100,
	}

	const MAX_FIGURE_PX = 140
	const MIN_FIGURE_PX = 20
	const tallestM = Math.max(pokemonHeightM, AVERAGE_HUMAN_HEIGHT_M)
	const pokemonFigurePx = Math.max(
		(pokemonHeightM / tallestM) * MAX_FIGURE_PX,
		MIN_FIGURE_PX,
	)
	const humanFigurePx = Math.max(
		(AVERAGE_HUMAN_HEIGHT_M / tallestM) * MAX_FIGURE_PX,
		MIN_FIGURE_PX,
	)
	const TICK_INTERVAL_PX = 14
	const TICK_COUNT = Math.floor(MAX_FIGURE_PX / TICK_INTERVAL_PX)

	return (
		<div className="detail-page">
			<div className="detail-header" style={{ backgroundColor: primaryColor }}>
				<p className="detail-watermark">{pokemon.name}</p>
				<div className="detail-dots" />
				<div className="detail-header-ornament">
					<PokeballIcon size={420} />
				</div>

				<div className="detail-header-top">
					{pokemon.cries?.latest && (
						<button
							className={`card-play-btn${isPlayingCry ? " is-playing" : ""}`}
							onClick={() => playCry(pokemon.id, pokemon.cries.latest)}
							title="Play Pokémon cry"
							aria-label="Play Pokémon cry"
						>
							<span className="card-play-btn-icon">
								<PlayIcon size={13} />
							</span>
							<span className="card-play-btn-wave">
								<WaveformIcon playing={isPlayingCry} size={16} bars={20} />
							</span>
						</button>
					)}

					<button
						className={`card-favorite-btn${isFavorite ? " is-favorite" : ""}`}
						onClick={() => {
							if (isFavorite) {
								removeFavorite(pokemon.id)
							} else {
								playFavoriteSound()
								addFavorite(pokemon)
							}
						}}
						aria-label="Toggle favorite"
					>
						<StarIcon filled={isFavorite} size={18} />
					</button>
				</div>

				{prevPokemon && (
					<Link
						className="detail-nav detail-nav-prev"
						to={`/pokemon/${prevPokemon.name}`}
						aria-label={`Previous: ${prevPokemon.name}`}
						title={prevPokemon.name}
					>
						<MdChevronLeft size={26} />
					</Link>
				)}

				{nextPokemon && (
					<Link
						className="detail-nav detail-nav-next"
						to={`/pokemon/${nextPokemon.name}`}
						aria-label={`Next: ${nextPokemon.name}`}
						title={nextPokemon.name}
					>
						<MdChevronRight size={26} />
					</Link>
				)}

				<div className="detail-header-info">
					<p className="detail-id">#{String(pokemon.id).padStart(3, "0")}</p>
					<p className="detail-name">{pokemon.name}</p>

					{(genus || species?.is_legendary || species?.is_mythical) && (
						<p className="detail-genus">
							{genus}
							{species?.is_mythical && (
								<span className="detail-special-badge is-mythical">
									Mythical
								</span>
							)}
							{!species?.is_mythical && species?.is_legendary && (
								<span className="detail-special-badge is-legendary">
									Legendary
								</span>
							)}
						</p>
					)}

					<div className="type-badge-row detail-type-row">
						{pokemon.types.map(({ type }) => (
							<span key={type.name} className="type-badge">
								<TypeIcon type={type.name} size={12} />
								{type.name}
							</span>
						))}
					</div>

					{evolvesFromName && (
						<p className="detail-evolves-from">
							Evolves from{" "}
							{evolvesFromMatch ? (
								<Link to={`/pokemon/${evolvesFromName}`}>
									{evolvesFromName}
								</Link>
							) : (
								<span>{evolvesFromName}</span>
							)}
						</p>
					)}
				</div>

				<PokemonImage
					className="detail-image"
					src={pokemon.sprites.other["official-artwork"].front_default}
					alt={pokemon.name}
					iconSize={160}
				/>
			</div>

			<div className="detail-content">
				{flavorTextEntry && (
					<section className="detail-section">
						<h2 className="detail-section-title" style={{ color: primaryColor }}>
							Pokédex Entry
						</h2>
						<p className="detail-flavor-text">
							{cleanFlavorText(flavorTextEntry.flavor_text)}
						</p>
					</section>
				)}

				<section className="detail-section">
					<h2 className="detail-section-title" style={{ color: primaryColor }}>
						Pokédex Data
					</h2>

					<div className="detail-data-row">
						<span className="detail-data-label">Height</span>
						<span className="detail-data-value">{pokemon.height / 10} m</span>
					</div>
					<div className="detail-data-row">
						<span className="detail-data-label">Weight</span>
						<span className="detail-data-value">{pokemon.weight / 10} kg</span>
					</div>
					<div className="detail-data-row">
						<span className="detail-data-label">Abilities</span>
						<span className="detail-data-value">
							{pokemon.abilities
								.map(
									(a) =>
										a.ability.name + (a.is_hidden ? " (hidden ability)" : ""),
								)
								.join(", ")}
						</span>
					</div>
					{pokemon.base_experience && (
						<div className="detail-data-row">
							<span className="detail-data-label">Base Experience</span>
							<span className="detail-data-value">
								{pokemon.base_experience}
							</span>
						</div>
					)}
					{catchDifficulty && (
						<div className="detail-data-row">
							<span className="detail-data-label">Catch Difficulty</span>
							<span className="detail-data-value">{catchDifficulty}</span>
						</div>
					)}
					{species?.habitat && (
						<div className="detail-data-row">
							<span className="detail-data-label">Habitat</span>
							<span className="detail-data-value">
								{species.habitat.name.replace(/-/g, " ")}
							</span>
						</div>
					)}
					{species?.growth_rate && (
						<div className="detail-data-row">
							<span className="detail-data-label">Growth Rate</span>
							<span className="detail-data-value">
								{species.growth_rate.name.replace(/-/g, " ")}
							</span>
						</div>
					)}
				</section>

				{species && (
					<section className="detail-section">
						<h2 className="detail-section-title" style={{ color: primaryColor }}>
							Gender Ratio
						</h2>

						{species.gender_rate === -1 ? (
							<p className="gender-ratio-genderless">Genderless</p>
						) : (
							<div className="gender-ratio-chart">
								<div
									className="gender-ratio-column"
									title={`Male: ${femaleMalePct.male.toFixed(1)}%`}
								>
									<div className="gender-ratio-column-track">
										<div
											className="gender-ratio-column-fill is-male"
											style={{ height: `${femaleMalePct.male}%` }}
										/>
									</div>
									<span className="gender-ratio-column-label is-male">
										♂ {femaleMalePct.male.toFixed(1)}%
									</span>
								</div>
								<div
									className="gender-ratio-column"
									title={`Female: ${femaleMalePct.female.toFixed(1)}%`}
								>
									<div className="gender-ratio-column-track">
										<div
											className="gender-ratio-column-fill is-female"
											style={{ height: `${femaleMalePct.female}%` }}
										/>
									</div>
									<span className="gender-ratio-column-label is-female">
										♀ {femaleMalePct.female.toFixed(1)}%
									</span>
								</div>
							</div>
						)}
					</section>
				)}

				<section className="detail-section">
					<h2 className="detail-section-title" style={{ color: primaryColor }}>
						Size Comparison
					</h2>

					<p className="size-comparison-label">
						{getSizeComparisonLabel(pokemonHeightM)}
					</p>

					<div className="size-comparison">
						<div className="size-comparison-item">
							<div
								className="size-comparison-ruler"
								style={{ height: MAX_FIGURE_PX }}
							>
								{Array.from({ length: TICK_COUNT + 1 }).map((_, i) => (
									<span
										key={i}
										className={`size-comparison-tick${
											i % 5 === 0 ? " is-major" : ""
										}`}
										style={{ bottom: i * TICK_INTERVAL_PX }}
									/>
								))}
							</div>
							{/* placeholder invisible — reserve baris caption yang sama
							tingginya kayak 2 kolom lain, biar kaki ruler-nya sejajar
							sama kaki gambar (bukan sejajar sama bawah teks caption) */}
							<span className="size-comparison-name" aria-hidden="true">
								&nbsp;
							</span>
							<span className="size-comparison-value" aria-hidden="true">
								&nbsp;
							</span>
						</div>

						<div className="size-comparison-item">
							<div
								className="size-comparison-stage"
								style={{ height: MAX_FIGURE_PX }}
							>
								<div
									className="size-comparison-figure"
									style={{ height: humanFigurePx }}
								>
									<HumanIcon size={humanFigurePx} />
								</div>
							</div>
							<span className="size-comparison-name">Human</span>
							<span className="size-comparison-value">
								{AVERAGE_HUMAN_HEIGHT_M} m
							</span>
						</div>

						<div className="size-comparison-item">
							<div
								className="size-comparison-stage"
								style={{ height: MAX_FIGURE_PX }}
							>
								<div
									className="size-comparison-figure"
									style={{ height: pokemonFigurePx }}
								>
									<PokemonImage
										className="size-comparison-image"
										src={pokemon.image}
										alt={pokemon.name}
										iconSize={Math.max(pokemonFigurePx * 0.8, 28)}
									/>
								</div>
							</div>
							<span className="size-comparison-name">{pokemon.name}</span>
							<span className="size-comparison-value">
								{pokemonHeightM} m
							</span>
						</div>
					</div>
				</section>

				<section className="detail-section">
					<h2 className="detail-section-title" style={{ color: primaryColor }}>
						Base Stats
					</h2>

					{pokemon.stats.map(({ stat, base_stat }) => (
						<div className="stat-row" key={stat.name}>
							<span className="stat-label">
								{STAT_LABELS[stat.name] ?? stat.name}
							</span>
							<span className="stat-value">{base_stat}</span>
							<div className="stat-bar-track">
								<div
									className="stat-bar-fill"
									style={{
										width: `${Math.min((base_stat / STAT_BAR_MAX) * 100, 100)}%`,
										backgroundColor: primaryColor,
									}}
								/>
							</div>
						</div>
					))}
				</section>

				{weaknesses.length > 0 && (
					<section className="detail-section">
						<h2 className="detail-section-title" style={{ color: primaryColor }}>
							Weaknesses
						</h2>

						<div className="type-badge-row detail-weaknesses-row">
							{weaknesses.map((typeName) => (
								<span key={typeName} className="type-badge">
									<TypeIcon type={typeName} size={12} />
									{typeName}
								</span>
							))}
						</div>
					</section>
				)}

				{moveNames.length > 0 && (
					<section className="detail-section">
						<h2 className="detail-section-title" style={{ color: primaryColor }}>
							Moves
						</h2>

						<div className="move-badge-row">
							{visibleMoves.map((moveName) => (
								<span key={moveName} className="move-badge">
									{moveName}
								</span>
							))}
						</div>

						{moveNames.length > MOVES_PREVIEW_COUNT && (
							<button
								type="button"
								className="detail-toggle-btn"
								onClick={() => setShowAllMoves((v) => !v)}
							>
								{showAllMoves ? "Show less" : `Show all (${moveNames.length})`}
								<MdKeyboardArrowDown
									className={`detail-toggle-icon${
										showAllMoves ? " is-expanded" : ""
									}`}
									size={13}
								/>
							</button>
						)}
					</section>
				)}

				{pokemon.abilities.length > 0 && (
					<section className="detail-section">
						<h2 className="detail-section-title" style={{ color: primaryColor }}>
							Ability Details
						</h2>

						<div className="ability-detail-list">
							{pokemon.abilities.map((a) => {
								const detail = abilityDetails[a.ability.name]
								const effect = detail?.effect_entries.find(
									(e) => e.language.name === "en",
								)

								return (
									<div
										key={a.ability.name}
										className={`ability-detail-card${a.is_hidden ? " is-hidden" : ""}`}
										style={{ borderLeftColor: primaryColor }}
									>
										<div
											className="ability-detail-icon"
											style={{
												background: a.is_hidden
													? undefined
													: hexToRgba(primaryColor, 0.15),
												color: a.is_hidden ? undefined : primaryColor,
											}}
										>
											<MdAutoAwesome size={17} />
										</div>

										<div className="ability-detail-body">
											<p className="ability-detail-name">
												{a.ability.name}
												{a.is_hidden && (
													<span className="ability-detail-hidden">Hidden</span>
												)}
											</p>

											{effect ? (
												<>
													<p className="ability-detail-effect">
														{effect.short_effect}
													</p>
													<p className="ability-detail-gen">
														Introduced in{" "}
														{formatGeneration(detail.generation.name)}
													</p>
												</>
											) : (
												<p className="ability-detail-effect is-loading">
													Loading…
												</p>
											)}
										</div>
									</div>
								)
							})}
						</div>
					</section>
				)}

				{evolutionStages.length > 1 && (
					<section className="detail-section">
						<h2 className="detail-section-title" style={{ color: primaryColor }}>
							Evolution Chain
						</h2>

						<div className="evolution-chain">
							{evolutionStages.map((stage, stageIndex) => (
								<Fragment key={stageIndex}>
									{stageIndex > 0 && (
										<span className="evolution-arrow">→</span>
									)}
									<div className="evolution-stage">
										{stage.map((member) => {
											const matched = index.find(
												(item) => item.name === member.name,
											)

											return (
												<Link
													key={member.name}
													to={matched ? `/pokemon/${member.name}` : "#"}
													className={`evolution-node${
														member.name === pokemon.name ? " is-current" : ""
													}`}
												>
													{matched?.image ? (
														<PokemonImage
															className="evolution-node-image"
															src={matched.image}
															alt={member.name}
															iconSize={32}
														/>
													) : (
														<span className="evolution-node-fallback">
															<PokeballIcon size={22} />
														</span>
													)}
													<span className="evolution-node-text">
														<span className="evolution-node-name">
															{member.name}
														</span>
														{member.label && (
															<span className="evolution-node-label">
																{member.label}
															</span>
														)}
													</span>
												</Link>
											)
										})}
									</div>
								</Fragment>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	)
}

export default PokemonDetailPage
