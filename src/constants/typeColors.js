export const TYPE_COLORS = {
	normal: "#9DA0AA",
	fire: "#FD7D24",
	water: "#4A90DA",
	electric: "#EED535",
	grass: "#62B957",
	ice: "#61CEC0",
	fighting: "#D04164",
	poison: "#A552CC",
	ground: "#DD7748",
	flying: "#748FC9",
	psychic: "#EA5D60",
	bug: "#8CB330",
	rock: "#BAAB82",
	ghost: "#556AAE",
	dragon: "#0F6AC0",
	dark: "#58575F",
	steel: "#417D9A",
	fairy: "#ED6EC7",
}

// Palette KEDUA, lebih soft/pastel — khusus buat background gede (card
// home, header detail, card compare), diambil dari file Figma "Pokédex"
// (frame "Column", swatch card per type). TYPE_COLORS di atas (lebih
// vivid/solid) tetep dipake buat badge/chip type — dua warna beda ini
// justru yang bikin chip gak pernah "nyatu" ilang sama background di
// belakangnya, gak perlu akalin pake shadow doang.
export const CARD_COLORS = {
	bug: "#8BD674",
	dark: "#6F6E78",
	dragon: "#7383B9",
	electric: "#F2CB55",
	fairy: "#EBA8C3",
	fighting: "#EB4971",
	fire: "#FFA756",
	flying: "#83A2E3",
	ghost: "#8571BE",
	grass: "#8BBE8A",
	ground: "#F78551",
	ice: "#91D8DF",
	normal: "#B5B9C4",
	poison: "#9F6E97",
	psychic: "#FF6568",
	rock: "#D4C294",
	steel: "#4C91B3",
	water: "#58ABF6",
}

export const TYPE_ICONS = {
	normal: "⚪",
	fire: "🔥",
	water: "💧",
	electric: "⚡",
	grass: "🌿",
	ice: "❄️",
	fighting: "👊",
	poison: "☠️",
	ground: "⛰️",
	flying: "🕊️",
	psychic: "🔮",
	bug: "🐛",
	rock: "🪨",
	ghost: "👻",
	dragon: "🐉",
	dark: "🌑",
	steel: "⚙️",
	fairy: "✨",
}

export const getTypeColor = (typeName) => TYPE_COLORS[typeName] ?? "#777777"
export const getCardColor = (typeName) => CARD_COLORS[typeName] ?? "#9CA3AF"
export const getTypeIcon = (typeName) => TYPE_ICONS[typeName] ?? ""

// pokemon.types itu array [{ type: { name } }, ...] — type PERTAMA di
// array itu yang dianggep "warna utama"-nya (dipake buat header, card,
// dll di banyak tempat), jadi ditaro di sini biar gak perlu nulis ulang
// `types?.[0]?.type?.name` tiap kali butuh warnanya
export const getPrimaryCardColor = (types) => getCardColor(types?.[0]?.type?.name)

export const hexToRgba = (hex, alpha = 1) => {
	const clean = hex.replace("#", "")
	const r = parseInt(clean.substring(0, 2), 16)
	const g = parseInt(clean.substring(2, 4), 16)
	const b = parseInt(clean.substring(4, 6), 16)
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
