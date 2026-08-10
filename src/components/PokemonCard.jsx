import { getTypeColor } from "../constants/typeColors"

const PokemonCard = ({ id, name, image, types, onSelectPokemon, onAddFavorite }) => {
	return (
		<li className="pokemon-card">
			<img className="pokemon-card-image" src={image} alt={name} />
			<p className="pokemon-card-name">{name}</p>

			{types?.length > 0 && (
				<div className="type-badge-row">
					{types.map(({ type }) => (
						<span
							key={type.name}
							className="type-badge"
							style={{ backgroundColor: getTypeColor(type.name) }}
						>
							{type.name}
						</span>
					))}
				</div>
			)}

			<div className="card-actions">
				<button className="btn" onClick={() => onSelectPokemon(id)}>
					See Detail
				</button>

				<button className="btn btn-primary" onClick={() => onAddFavorite(id)}>
					Add to Favorites
				</button>
			</div>
		</li>
	)
}

export default PokemonCard
