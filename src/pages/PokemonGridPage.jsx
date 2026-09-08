import { useEffect } from "react"
import PokemonList from "../components/PokemonList"
import Pagination from "../components/Pagination"
import { TypeFilter } from "../components/TypeFilter"
import LoadingSpinner from "../components/LoadingSpinner"
import { useFavoriteStore } from "../store/useFavoriteStore"
import { usePokemonStore } from "../store/usePokemonStore"
import { useSearchParams } from "react-router"

const PAGE_SIZE = 21

const PokemonGridPage = ({ index, keyword }) => {
	const addFavoritePokemon = useFavoriteStore((state) => state.addFavorite)
	const detailsByName = usePokemonStore((state) => state.detailsByName)
	const typeMembers = usePokemonStore((state) => state.typeMembers)
	const ensureDetails = usePokemonStore((state) => state.ensureDetails)
	const ensureTypeMembers = usePokemonStore((state) => state.ensureTypeMembers)

	const [searchParams, setSearchParams] = useSearchParams({})
	const selectedTypes = searchParams.getAll("type")
	const currentPage = Number(searchParams.get("page")) || 1
	const selectedTypesKey = selectedTypes.join(",")

	// filter by type butuh tau anggota tiap type yang dipilih — itu
	// di-fetch on-demand di sini (bukan detail SEMUA Pokemon)
	useEffect(() => {
		if (selectedTypesKey) ensureTypeMembers(selectedTypesKey.split(","))
	}, [selectedTypesKey, ensureTypeMembers])

	const isTypeLoading = selectedTypes.some((t) => !typeMembers[t])

	const filteredIndex = index.filter((pokemon) => {
		const matchSearch = pokemon.name
			.toLowerCase()
			.trim()
			.includes(keyword.toLowerCase().trim())

		const matchType =
			selectedTypes.length === 0 ||
			selectedTypes.some((t) => typeMembers[t]?.has(pokemon.name))

		return matchSearch && matchType
	})

	const totalPages = Math.ceil(filteredIndex.length / PAGE_SIZE)

	const paginatedIndex = filteredIndex.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	)

	const pageNamesKey = paginatedIndex.map((p) => p.name).join(",")

	// detail lengkap (stats, types, cries, dll) cuma di-fetch buat
	// Pokemon yang lagi ditampilin di halaman ini — bukan semuanya
	useEffect(() => {
		if (pageNamesKey) ensureDetails(pageNamesKey.split(","))
	}, [pageNamesKey, ensureDetails])

	const paginatedPokemon = paginatedIndex.map(
		(p) => detailsByName[p.name] ?? { name: p.name, pending: true },
	)

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

			{filteredIndex.length === 0 ? (
				isTypeLoading ? (
					<LoadingSpinner />
				) : (
					<p className="status-message">Pokemon not found</p>
				)
			) : (
				<>
					<PokemonList
						data={paginatedPokemon}
						onAddFavorite={addFavoritePokemon}
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
