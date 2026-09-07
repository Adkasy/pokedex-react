import PokemonCard from "./PokemonCard"
import SkeletonCard from "./SkeletonCard"

// Tiap entry di `data` biasanya objek detail Pokemon lengkap, TAPI bisa
// juga placeholder `{ name, pending: true }` buat slot yang detailnya
// masih di-fetch (liat PokemonGridPage) — placeholder itu ditampilin
// sebagai skeleton card, bukan card beneran.
const PokemonList = ({ data, onAddFavorite }) => {
	return (
		<ul className="pokemon-grid">
			{data.map((pokemon, index) => {
				if (pokemon.pending) return <SkeletonCard key={pokemon.name} />

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
