export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

// PokeAPI generation names dateng dalam bentuk "generation-iii" — ubah
// jadi "Generation III" (angka romawinya di-uppercase, bukan
// di-capitalize kaya CSS text-transform biasa yang hasilnya
// "Generation-Iii" acak-acakan)
export const formatGeneration = (name) => {
	const roman = name?.split("-")[1]
	return roman ? `Generation ${roman.toUpperCase()}` : name
}
