import PokemonCard from "./PokemonCard"

const PokemonList = ({ data, onAddFavorite }) => {
	return (
		<ul className="pokemon-grid">
			{data.map((pokemon, index) => {
				const { id, name, image, types, cries } = pokemon

				return (
					<PokemonCard
						key={name}
						id={id}
						name={name}
						image={image}
						types={types}
						cries={cries}
						index={index}
						onAddFavorite={onAddFavorite}
					/>
				)
			})}
		</ul>
	)
}

export default PokemonList
