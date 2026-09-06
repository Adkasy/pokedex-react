import { useEffect } from "react"
import PokemonList from "../components/PokemonList"
import Pagination from "../components/Pagination"
import { TypeFilter } from "../components/TypeFilter"
import { useFavoriteStore } from "../store/useFavoriteStore"
import { useSearchParams } from "react-router"

const PAGE_SIZE = 21

const PokemonGridPage = ({ pokemonList, keyword }) => {
	const addFavoritePokemon = useFavoriteStore((state) => state.addFavorite)
	const [searchParams, setSearchParams] = useSearchParams({})
	const selectedTypes = searchParams.getAll("type")
	const currentPage = Number(searchParams.get("page")) || 1

	const filteredPokemon = pokemonList.filter((pokemon) => {
		const matchSearch = pokemon.name
			.toLowerCase()
			.trim()
			.includes(keyword.toLowerCase().trim())

		const matchType =
			selectedTypes.length === 0 ||
			pokemon.types.some((t) => selectedTypes.includes(t.type.name))

		return matchSearch && matchType
	})

	const totalPages = Math.ceil(filteredPokemon.length / PAGE_SIZE)

	const paginatedPokemon = filteredPokemon.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	)

	const handleAddFavorite = (id) => {
		const pokemon = pokemonList.find((item) => item.id === id)
		addFavoritePokemon(pokemon)
	}

	const toggleType = (typeName) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)
			const currentTypes = next.getAll("type")

			next.delete("type")

			const updatedTypes = currentTypes.includes(typeName)
				? currentTypes.filter((t) => t !== typeName)
				: [...currentTypes, typeName]

			updatedTypes.forEach((type) => next.append("type", type))

			next.delete("page")

			return next
		})
	}

	const handleResetTypes = () => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)

			next.delete("type")
			next.delete("page")

			return next
		})
	}

	const goToPage = (page) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev)

			if (page === 1) {
				next.delete("page")
			} else {
				next.set("page", page)
			}

			return next
		})
	}

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [currentPage])

	return (
		<>
			<TypeFilter
				selectedTypes={selectedTypes}
				onToggleType={toggleType}
				onReset={handleResetTypes}
			/>

			{filteredPokemon.length === 0 ? (
				<p className="status-message">Pokemon not found</p>
			) : (
				<>
					<PokemonList
						data={paginatedPokemon}
						onAddFavorite={handleAddFavorite}
					/>

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={goToPage}
					/>
				</>
			)}
		</>
	)
}

export default PokemonGridPage
