import { useParams, Link } from "react-router"
import { getTypeColor, hexToRgba } from "../constants/typeColors"
import { useFavoriteStore } from "../store/useFavoriteStore"
import TypeIcon, { StarIcon, PokeballIcon } from "../components/TypeIcon"

const STAT_LABELS = {
	hp: "HP",
	attack: "Attack",
	defense: "Defense",
	"special-attack": "Sp. Atk",
	"special-defense": "Sp. Def",
	speed: "Speed",
}

// Skala bar stat — bukan angka resmi dari PokeAPI (itu butuh fetch tambahan
// ke /pokemon-species buat range level-100), ini cuma perkiraan visual biar
// ada progress bar, base_stat dibagi 200 lalu dibatasin max 100%.
const STAT_BAR_MAX = 200

const PokemonDetailPage = ({ pokemonList }) => {
	const { name } = useParams()
	const pokemon = pokemonList.find((item) => item.name === name)
	const addFavorite = useFavoriteStore((state) => state.addFavorite)
	const isFavorite = useFavoriteStore((state) =>
		pokemon ? state.favorites.some((f) => f.id === pokemon.id) : false,
	)

	if (!pokemon) return <p className="status-message">Pokemon gak ketemu.</p>

	const primaryColor = getTypeColor(pokemon.types?.[0]?.type?.name)

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
						onClick={() => addFavorite(pokemon)}
						aria-label="Toggle favorite"
					>
						<StarIcon filled={isFavorite} size={18} />
					</button>
				</div>

				<div className="detail-header-info">
					<p className="detail-id">#{String(pokemon.id).padStart(3, "0")}</p>
					<p className="detail-name">{pokemon.name}</p>

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
			</div>
		</div>
	)
}

export default PokemonDetailPage
