export const ALL_TYPE_NAMES = [
	"normal",
	"fire",
	"water",
	"electric",
	"grass",
	"ice",
	"fighting",
	"poison",
	"ground",
	"flying",
	"psychic",
	"bug",
	"rock",
	"ghost",
	"dragon",
	"dark",
	"steel",
	"fairy",
]

// Gabungin damage_relations dari 1-2 type (pokemon dual-type) jadi 1
// tabel multiplier per attacking-type. Kalikan tiap type, karena
// efeknya emang stacking (misal Ground x Rock = 4x buat Fire/Flying).
export const computeTypeEffectiveness = (typeDetailList) => {
	const multipliers = {}
	ALL_TYPE_NAMES.forEach((typeName) => {
		multipliers[typeName] = 1
	})

	typeDetailList.forEach(({ damage_relations }) => {
		damage_relations.double_damage_from.forEach((t) => {
			multipliers[t.name] *= 2
		})
		damage_relations.half_damage_from.forEach((t) => {
			multipliers[t.name] *= 0.5
		})
		damage_relations.no_damage_from.forEach((t) => {
			multipliers[t.name] *= 0
		})
	})

	return multipliers
}

// Kelompokin multiplier jadi 3 bucket buat ditampilin: lemah (>1x),
// tahan (<1x tapi >0), kebal (0x). Multiplier 1x (netral) gak
// ditampilin — gak ada info menarik buat ditunjukin.
export const groupTypeEffectiveness = (multipliers) => {
	const weakTo = []
	const resists = []
	const immuneTo = []

	ALL_TYPE_NAMES.forEach((typeName) => {
		const value = multipliers[typeName]

		if (value > 1) weakTo.push({ type: typeName, value })
		else if (value > 0 && value < 1) resists.push({ type: typeName, value })
		else if (value === 0) immuneTo.push({ type: typeName, value })
	})

	weakTo.sort((a, b) => b.value - a.value)
	resists.sort((a, b) => a.value - b.value)

	return { weakTo, resists, immuneTo }
}
