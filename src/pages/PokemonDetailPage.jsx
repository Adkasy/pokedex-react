import { Fragment, useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { MdChevronLeft, MdChevronRight } from "react-icons/md"
import { getTypeColor } from "../constants/typeColors"
import { useFavoriteStore } from "../store/useFavoriteStore"
import { usePokemonStore } from "../store/usePokemonStore"
import TypeIcon, {
	StarIcon,
	PokeballIcon,
	HumanIcon,
} from "../components/TypeIcon"
import PokemonImage from "../components/PokemonImage"
import { playFavoriteSound } from "../utils/sound"
import { getPokemonSpecies, getEvolutionChain } from "../api/pokeapi"
import { flattenEvolutionChain, cleanFlavorText } from "../utils/evolution"
import {
	getCatchDifficulty,
	getSizeComparisonLabel,
	AVERAGE_HUMAN_HEIGHT_M,
} from "../utils/pokedexFacts"
import { STAT_LABELS } from "../constants/statLabels"

const STAT_BAR_MAX = 200

const PokemonDetailPage = ({ index }) => {
	const { name } = useParams()
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
	const [species, setSpecies] = useState(null)
	const [evolutionStages, setEvolutionStages] = useState([])

	useEffect(() => {
		ensureDetails([name])
	}, [name, ensureDetails])

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

	if (!pokemon) {
		return (
			<p className="status-message">
				{existsInIndex ? "Loading…" : "Pokemon not found."}
			</p>
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

	// prev/next Pokemon ngikutin urutan index (yang ngikutin urutan id
	// dari PokeAPI) — bukan berdasarkan urutan generation/dex khusus
	const currentIndexPos = index.findIndex((item) => item.name === name)
	const prevPokemon =
		currentIndexPos > 0 ? index[currentIndexPos - 1] : null
	const nextPokemon =
		currentIndexPos !== -1 && currentIndexPos < index.length - 1
			? index[currentIndexPos + 1]
			: null

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
					iconSize={130}
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
				</section>

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
										iconSize={Math.max(pokemonFigurePx * 0.65, 22)}
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
															iconSize={26}
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
