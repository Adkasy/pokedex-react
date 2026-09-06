const TRIGGER_LABELS = {
	"level-up": "Level up",
	"use-item": "Use item",
	trade: "Trade",
	shed: "Special",
	spin: "Spin",
	"take-damage": "Take damage",
	"three-critical-hits": "3 critical hits",
	"tower-of-darkness": "Tower of Darkness",
	"tower-of-waters": "Tower of Waters",
	"agile-style-move": "Agile style move",
	"strong-style-move": "Strong style move",
	other: "Special condition",
}

const formatName = (str) => str.replace(/-/g, " ")

// Nyusun label singkat kayak "Lv. 16" atau "Water Stone" dari satu
// evolution_details entry — biasanya cuma 1-2 syarat yang relevan
// buat ditampilin, gak perlu semua field-nya.
export const getEvolutionLabel = (detail) => {
	if (!detail) return null

	if (detail.min_level) return `Lv. ${detail.min_level}`
	if (detail.item) return formatName(detail.item.name)
	if (detail.held_item) return `Holding ${formatName(detail.held_item.name)}`
	if (detail.min_happiness) return "High friendship"
	if (detail.known_move) return `Knows ${formatName(detail.known_move.name)}`
	if (detail.trade_species || detail.trigger?.name === "trade") return "Trade"

	return TRIGGER_LABELS[detail.trigger?.name] ?? "Special condition"
}

// Ubah struktur evolution-chain (nested `evolves_to`) jadi array per
// "tingkatan" (stage) — stage[0] = bentuk dasar, stage[1] = hasil
// evolve pertama (bisa lebih dari 1 kalau ada percabangan kayak
// Eevee), dst. Tiap node bawa `label`: syarat evolve DARI stage
// sebelumnya (null buat stage paling awal).
export const flattenEvolutionChain = (chainRoot) => {
	const stages = []
	let currentLevel = [{ node: chainRoot, label: null }]

	while (currentLevel.length > 0) {
		stages.push(
			currentLevel.map(({ node, label }) => ({
				name: node.species.name,
				label,
			})),
		)

		currentLevel = currentLevel.flatMap(({ node }) =>
			node.evolves_to.map((child) => ({
				node: child,
				label: getEvolutionLabel(child.evolution_details[0]),
			})),
		)
	}

	return stages
}

export const cleanFlavorText = (text) => text.replace(/[\n\f\r]+/g, " ")
