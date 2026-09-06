import { Fragment, useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { getTypeColor } from "../constants/typeColors"
import { useFavoriteStore } from "../store/useFavoriteStore"
import TypeIcon, { StarIcon, PokeballIcon } from "../components/TypeIcon"
import { playFavoriteSound } from "../utils/sound"
import { getPokemonSpecies, getEvolutionChain } from "../api/pokeapi"
import { flattenEvolutionChain, cleanFlavorText } from "../utils/evolution"

const STAT_LABELS = {
	hp: "HP",
	attack: "Attack",
	defense: "Defense",
	"special-attack": "Sp. Atk",
	"special-defense": "Sp. Def",
	speed: "Speed",
}

const STAT_BAR_MAX = 200

const PokemonDetailPage = ({ pokemonList }) => {
	const { name } = useParams()
	const pokemon = pokemonList.find((item) => item.name === name)
	const addFavorite = useFavoriteStore((state) => state.addFavorite)
	const removeFavorite = useFavoriteStore((state) => state.removeFavorite)
	const isFavorite = useFavoriteStore((state) =>
		pokemon ? state.favorites.some((f) => f.id === pokemon.id) : false,
	)
	const [species, setSpecies] = useState(null)
	const [evolutionStages, setEvolutionStages] = useState([])

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

	if (!pokemon) return <p className="status-message">Pokemon gak ketemu.</p>

	const primaryColor = getTypeColor(pokemon.types?.[0]?.type?.name)

	const genus = species?.genera.find((g) => g.language.name === "en")?.genus
	const flavorTextEntry = species?.flavor_text_entries.find(
		(f) => f.language.name === "en",
	)

	return (
		<div className="detail-page">
			<div className="detail-header" style={{ backgroundColor: primaryColor }}>
				<p className="detail-watermark">{pokemon.name}</p>
				<div className="detail-dots" />
				<div className="detail-header-ornament">
					<PokeballIcon size={210} />
				</div>

				<div className="detail-header-top">
					<Link className="detail-back" to="/" aria-label="Back to grid">
						←
					</Link>

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
				</div>

				<img
					className="detail-image"
					src={pokemon.sprites.other["official-artwork"].front_default}
					alt={pokemon.name}
				/>
			</div>

			<div className="detail-content">
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
				</section>

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
											const matched = pokemonList.find(
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
														<img src={matched.image} alt={member.name} />
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
