const BASE_URL = "https://pokeapi.co/api/v2"

// URL artwork ngikutin pola id yang bisa ditebak (sprite repo resminya
// PokeAPI) — jadi kita bisa dapetin gambar Pokemon tanpa perlu fetch
// detail lengkapnya dulu, cukup modal id doang.
const ARTWORK_BASE =
	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"

const getArtworkUrl = (id) => `${ARTWORK_BASE}/${id}.png`

const getIdFromUrl = (url) => Number(url.split("/").filter(Boolean).pop())

// Index RINGAN semua Pokemon (cuma nama + id + gambar) — 1 request doang
// meski jumlahnya 1300+, jadi aman gak bakal berat/kena rate limit kayak
// kalau kita fetch detail lengkap buat semuanya di awal. Detail lengkap
// (stats, types, dll) baru di-fetch belakangan per-Pokemon pas beneran
// dibutuhin (liat usePokemonStore).
const getPokemonIndex = async () => {
	const countRes = await fetch(`${BASE_URL}/pokemon?limit=1`)
	if (!countRes.ok) throw new Error("Error data count")
	const { count } = await countRes.json()

	const res = await fetch(`${BASE_URL}/pokemon?limit=${count}`)
	if (!res.ok) throw new Error("Error data index")
	const { results } = await res.json()

	return results.map(({ name, url }) => {
		const id = getIdFromUrl(url)
		return { id, name, image: getArtworkUrl(id) }
	})
}

// Daftar nama Pokemon yang punya type tertentu, dari endpoint /type/{name}
// — dipake buat filter by type tanpa perlu fetch detail SEMUA Pokemon
// cuma buat tau type-nya masing-masing.
const getPokemonNamesByType = async (typeName) => {
	const res = await fetch(`${BASE_URL}/type/${typeName}`)
	if (!res.ok) throw new Error("Error data type")
	const data = await res.json()
	return data.pokemon.map((p) => p.pokemon.name)
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

const getAbilityDetail = async (name) => {
	const res = await fetch(`${BASE_URL}/ability/${name}`)
	if (!res.ok) throw new Error("Error data ability")
	return res.json()
}

export {
	BASE_URL,
	getArtworkUrl,
	getPokemonIndex,
	getPokemonNamesByType,
	getDataDetailPokemon,
	getPokemonSpecies,
	getEvolutionChain,
	getAbilityDetail,
}
