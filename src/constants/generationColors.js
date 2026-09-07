// Warna solid per generasi game, dipilih dari palette yang udah dipake
// di tempat lain (type colors, chip battle simulator) biar nyambung
// sama tema keseluruhan — bukan warna baru yang asal comot.
const GENERATION_COLORS = {
	i: { bg: "#FD7D24", text: "#fff" }, // fire
	ii: { bg: "#4A90DA", text: "#fff" }, // water
	iii: { bg: "#62B957", text: "#fff" }, // grass
	iv: { bg: "#EED535", text: "#3a2c00" }, // electric — teks gelap biar kebaca
	v: { bg: "#EA5D60", text: "#fff" }, // psychic
	vi: { bg: "#556AAE", text: "#fff" }, // ghost
	vii: { bg: "#ED6EC7", text: "#fff" }, // fairy
	viii: { bg: "#58575F", text: "#fff" }, // dark
	ix: { bg: "#A552CC", text: "#fff" }, // poison
}

const DEFAULT_GENERATION_COLOR = { bg: "var(--border)", text: "var(--text-h)" }

// name-nya kayak "generation-iii" — ambil angka romawinya buat lookup
export const getGenerationColor = (name) => {
	const roman = name?.split("-")[1]
	return GENERATION_COLORS[roman] ?? DEFAULT_GENERATION_COLOR
}
