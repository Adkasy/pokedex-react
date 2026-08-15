// Warna & ikon per type Pokemon — diambil dari Figma design system
// (file "Pokédex App" by Flavio Farias), bukan tebakan manual lagi.
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
	bug: "#8CB230",
	rock: "#BAAB82",
	ghost: "#556AAE",
	dragon: "#0F6AC0",
	dark: "#58575F",
	steel: "#417D9A",
	fairy: "#ED6EC7",
}

// Figma-nya pake icon SVG custom per type — di sini dipendekin ke emoji
// (biar gak perlu import/manage file asset baru), tetep nangkep ide "icon + label".
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
export const getTypeIcon = (typeName) => TYPE_ICONS[typeName] ?? ""

// Buat shadow/overlay yang warnanya ngikutin warna card (bukan abu-abu generic)
export const hexToRgba = (hex, alpha = 1) => {
	const clean = hex.replace("#", "")
	const r = parseInt(clean.substring(0, 2), 16)
	const g = parseInt(clean.substring(2, 4), 16)
	const b = parseInt(clean.substring(4, 6), 16)
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
