import { useState } from "react"
import { Link } from "react-router"
import { getPrimaryTypeColor, hexToRgba } from "../constants/typeColors"
import TypeIcon, { PlayIcon, StarIcon, WaveformIcon } from "./TypeIcon"
import { useFavoriteStore } from "../store/useFavoriteStore"
import { useCryPlayerStore } from "../store/useCryPlayerStore"
import { playFavoriteSound } from "../utils/sound"
import PokemonImage from "./PokemonImage"

const PokemonCard = ({
	id,
	name,
	image,
	types,
	cries,
	index = 0,
	onAddFavorite,
}) => {
	const [frozenIndex] = useState(index)
	const primaryColor = getPrimaryTypeColor(types)
	const isFavorite = useFavoriteStore((state) =>
		state.favorites.some((f) => f.id === id),
	)
	const removeFavorite = useFavoriteStore((state) => state.removeFavorite)
	const isPlaying = useCryPlayerStore((state) => state.playingId === id)
	const playCry = useCryPlayerStore((state) => state.playCry)

	const handlePlayCry = (e) => {
		e.preventDefault()
		e.stopPropagation()
		playCry(id, cries?.latest)
	}

	return (
		<Link to={`/pokemon/${name}`} className="pokemon-card-link">
			<li
				className="pokemon-card"
				style={{
					backgroundColor: primaryColor,
					boxShadow: `0 14px 20px -8px ${hexToRgba(primaryColor, 0.5)}`,
					"--card-index": frozenIndex,
				}}
			>
				<div className="pokemon-card-dots" />
				<button
					className={`card-favorite-btn${isFavorite ? " is-favorite" : ""}`}
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						playFavoriteSound()
						if (isFavorite) {
							removeFavorite(id)
						} else {
							onAddFavorite(id)
						}
					}}
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

				{cries?.latest && (
					<button
						className={`card-play-btn${isPlaying ? " is-playing" : ""}`}
						onClick={handlePlayCry}
						title="Play Pokémon cry"
						aria-label="Play Pokémon cry"
					>
						<span className="card-play-btn-icon">
							<PlayIcon size={13} />
						</span>
						<span className="card-play-btn-wave">
							<WaveformIcon playing={isPlaying} size={16} />
						</span>
					</button>
				)}

				<PokemonImage
					className="pokemon-card-image"
					src={image}
					alt={name}
					iconSize={100}
				/>
			</li>
		</Link>
	)
}

export default PokemonCard
