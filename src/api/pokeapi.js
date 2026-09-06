const BASE_URL = "https://pokeapi.co/api/v2"

const getDataPokemon = async (limit = 200, offset = 0) => {
	const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`)
	if (!res.ok) throw new Error("Error data all")
	const allPokemonData = await res.json()

	const detailPromises = allPokemonData.results.map((pokemon) =>
		getDataDetailPokemon(pokemon.url),
	)

	return Promise.all(detailPromises)
}

const getDataDetailPokemon = async (detailURL) => {
	const res = await fetch(detailURL)
	if (!res.ok) throw new Error("Error data spesifik")
	const dataDetail = await res.json()

	const name = dataDetail.name
	const image = dataDetail.sprites.other["official-artwork"].front_default

	return {
		name,
		image,
		...dataDetail,
	}
}

const getPokemonSpecies = async (name) => {
	const res = await fetch(`${BASE_URL}/pokemon-species/${name}`)
	if (!res.ok) throw new Error("Error data species")
	return res.json()
}

const getEvolutionChain = async (url) => {
	const res = await fetch(url)
	if (!res.ok) throw new Error("Error data evolution chain")
	return res.json()
}

export {
	getDataPokemon,
	getDataDetailPokemon,
	getPokemonSpecies,
	getEvolutionChain,
}
