// Warna solid per generasi game, dipilih dari palette yang udah dipake
// di tempat lain (type colors, chip battle simulator) biar nyambung
// sama tema keseluruhan — bukan warna baru yang asal comot. Kuning
// (electric) sengaja dihindarin sama sekali di sini — kepucetan/kurang
// kontras kalau dipasangin teks putih, jadi generation-iv pake teal
// (ice) aja sebagai gantinya.
const GENERATION_COLORS = {
	i: "#FD7D24", // fire
	ii: "#4A90DA", // water
	iii: "#62B957", // grass
	iv: "#2BA89B", // ice, digelapin dikit dari teal-nya biar makin solid
	v: "#EA5D60", // psychic
	vi: "#556AAE", // ghost
	vii: "#ED6EC7", // fairy
	viii: "#58575F", // dark
	ix: "#A552CC", // poison
}

const DEFAULT_GENERATION_COLOR = "#6b7280"

// name-nya kayak "generation-iii" — ambil angka romawinya buat lookup
export const getGenerationColor = (name) => {
	const roman = name?.split("-")[1]
	return GENERATION_COLORS[roman] ?? DEFAULT_GENERATION_COLOR
}
