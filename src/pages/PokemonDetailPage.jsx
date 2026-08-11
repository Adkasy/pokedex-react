import { useParams, Link } from "react-router"
import { getTypeColor } from "../constants/typeColors"

const PokemonDetailPage = ({ pokemonList, onAddFavorite }) => {
	const { name } = useParams()
	const pokemon = pokemonList.find((item) => item.name === name)

	console.log(pokemon, "CEKI")

	if (!pokemon) return <p className="status-message">Pokemon gak ketemu.</p>

	return (
		<div className="detail-panel">
			<img
				className="detail-image"
				src={pokemon.sprites.other["official-artwork"].front_default}
				alt={pokemon.name}
			/>
			<p className="detail-name">{pokemon.name}</p>

			<div className="type-badge-row">
				{pokemon.types.map(({ type }) => (
					<span
						key={type.name}
						className="type-badge"
						style={{ backgroundColor: getTypeColor(type.name) }}
					>
						{type.name}
					</span>
				))}
			</div>

			<p className="detail-stat">Height: {pokemon.height / 10} m</p>
			<p className="detail-stat">Weight: {pokemon.weight / 10} kg</p>

			<div className="detail-actions">
				<Link className="btn" to="/">
					Back to Grid
				</Link>
				<button
					className="btn btn-primary"
					onClick={() => onAddFavorite(pokemon.id)}
				>
					Add to Favorites
				</button>
			</div>
		</div>
	)
}

export default PokemonDetailPage
