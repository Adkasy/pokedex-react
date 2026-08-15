import { Link } from "react-router"
import { getTypeColor, hexToRgba } from "../constants/typeColors"
import TypeIcon, { StarIcon } from "./TypeIcon"
import { useFavoriteStore } from "../store/useFavoriteStore"

const PokemonCard = ({ id, name, image, types, onAddFavorite }) => {
	const primaryColor = getTypeColor(types?.[0]?.type?.name)
	const isFavorite = useFavoriteStore((state) =>
		state.favorites.some((f) => f.id === id),
	)

	return (
		<li
			className="pokemon-card"
			style={{
				backgroundColor: primaryColor,
				boxShadow: `0 14px 20px -8px ${hexToRgba(primaryColor, 0.5)}`,
			}}
		>
			<div className="pokemon-card-dots" />

			<button
				className={`card-favorite-btn${isFavorite ? " is-favorite" : ""}`}
				onClick={() => onAddFavorite(id)}
				aria-label="Toggle favorite"
			>
				<StarIcon filled={isFavorite} size={16} />
			</button>

			<div className="pokemon-card-body">
				<p className="pokemon-card-id">#{String(id).padStart(3, "0")}</p>
				<p className="pokemon-card-name">{name}</p>

				{types?.length > 0 && (
					<div className="type-badge-row">
						{types.map(({ type }) => (
							<span key={type.name} className="type-badge">
								<TypeIcon type={type.name} size={9} />
								{type.name}
							</span>
						))}
					</div>
				)}
			</div>

			<img className="pokemon-card-image" src={image} alt={name} />

			<div className="card-actions">
				<Link className="btn btn-card" to={`/pokemon/${name}`}>
					See Detail
				</Link>
			</div>
		</li>
	)
}

export default PokemonCard
