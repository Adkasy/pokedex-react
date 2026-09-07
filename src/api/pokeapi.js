const BASE_URL = "https://pokeapi.co/api/v2"

// URL artwork ngikutin pola id yang bisa ditebak (sprite repo resminya
// PokeAPI) — jadi kita bisa dapetin gambar Pokemon tanpa perlu fetch
// detail lengkapnya dulu, cukup modal id doang.
const ARTWORK_BASE =
	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"

const getArtworkUrl = (id) => `${ARTWORK_BASE}/${id}.png`

const getIdFromUrl = (url) => Number(url.split("/").filter(Boolean).pop())

// Semua endpoint di bawah ngikutin pola yang sama: fetch, cek res.ok,
// lempar error yang jelas kalau gagal, baru parse JSON-nya — dipusatin
// di sini biar gak ditulis ulang di tiap fungsi.
const fetchJson = async (url, errorMessage) => {
	const res = await fetch(url)
	if (!res.ok) throw new Error(errorMessage)
	return res.json()
}

// Index RINGAN semua Pokemon (cuma nama + id + gambar) — 1 request doang
// meski jumlahnya 1300+, jadi aman gak bakal berat/kena rate limit kayak
// kalau kita fetch detail lengkap buat semuanya di awal. Detail lengkap
// (stats, types, dll) baru di-fetch belakangan per-Pokemon pas beneran
// dibutuhin (liat usePokemonStore).
const getPokemonIndex = async () => {
	const { count } = await fetchJson(`${BASE_URL}/pokemon?limit=1`, "Error data count")
	const { results } = await fetchJson(`${BASE_URL}/pokemon?limit=${count}`, "Error data index")

	return results.map(({ name, url }) => {
		const id = getIdFromUrl(url)
		return { id, name, image: getArtworkUrl(id) }
	})
}

// Daftar nama Pokemon yang punya type tertentu, dari endpoint /type/{name}
// — dipake buat filter by type tanpa perlu fetch detail SEMUA Pokemon
// cuma buat tau type-nya masing-masing.
const getPokemonNamesByType = async (typeName) => {
	const data = await fetchJson(`${BASE_URL}/type/${typeName}`, "Error data type")
	return data.pokemon.map((p) => p.pokemon.name)
}

const getDataDetailPokemon = async (detailURL) => {
	const dataDetail = await fetchJson(detailURL, "Error data spesifik")

	return {
		name: dataDetail.name,
		image: dataDetail.sprites.other["official-artwork"].front_default,
		...dataDetail,
	}
}

const getPokemonSpecies = (name) =>
	fetchJson(`${BASE_URL}/pokemon-species/${name}`, "Error data species")

const getEvolutionChain = (url) => fetchJson(url, "Error data evolution chain")

const getAbilityDetail = (name) =>
	fetchJson(`${BASE_URL}/ability/${name}`, "Error data ability")

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
