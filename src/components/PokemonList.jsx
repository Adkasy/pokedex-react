import PokemonCard from "./PokemonCard"

const PokemonList = ({ data, onSelectPokemon, onAddFavorite }) => {
	return (
		<ul className="pokemon-grid">
			{data.map((pokemon) => {
				const { id, name, image, types } = pokemon
				return (
					<PokemonCard
						key={name}
						id={id}
						name={name}
						image={image}
						types={types}
						onSelectPokemon={onSelectPokemon}
						onAddFavorite={onAddFavorite}
					/>
				)
			})}
		</ul>
	)
}

export default PokemonList
