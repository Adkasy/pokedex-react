import { getTypeMultiplier } from "../constants/typeChart"
import { capitalize } from "./text"

const HP_SCALE = 3
const MAX_ROUNDS = 30
const DAMAGE_CONSTANT = 18

const getStat = (pokemon, statName) =>
	pokemon.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0

const rollDamage = (attacker, defender) => {
	const attackStat = getStat(attacker, "attack")
	const defenseStat = getStat(defender, "defense")
	const attackType = attacker.types[0]?.type?.name ?? "normal"
	const defenderTypes = defender.types.map((t) => t.type.name)

	const typeMult = getTypeMultiplier(attackType, defenderTypes)
	const randomFactor = 0.85 + Math.random() * 0.15

	const damage = Math.max(
		1,
		Math.round(
			(attackStat / defenseStat) * DAMAGE_CONSTANT * typeMult * randomFactor,
		),
	)

	return { damage, typeMult }
}

const effectivenessNote = (typeMult) => {
	if (typeMult === 0) return " It has no effect!"
	if (typeMult > 1) return " It's super effective!"
	if (typeMult < 1) return " It's not very effective..."
	return ""
}

// Simulasi battle 1v1 sederhana: speed nentuin urutan gerak, damage
// dari rasio Attack/Defense × type effectiveness × sedikit random,
// bukan replika akurat game aslinya (gak ada moveset/PP/status) —
// tujuannya biar seru ditonton & hasilnya gak selalu ketebak.
export const simulateBattle = (pokemonA, pokemonB) => {
	const log = []
	const maxHpA = getStat(pokemonA, "hp") * HP_SCALE
	const maxHpB = getStat(pokemonB, "hp") * HP_SCALE
	const hp = { a: maxHpA, b: maxHpB }
	const pokemon = { a: pokemonA, b: pokemonB }

	const speedA = getStat(pokemonA, "speed")
	const speedB = getStat(pokemonB, "speed")
	const first = speedA >= speedB ? "a" : "b"
	const second = first === "a" ? "b" : "a"

	log.push({
		type: "start",
		side: null,
		text: `${capitalize(pokemon[first].name)} moves first (higher Speed)!`,
		hpA: hp.a,
		hpB: hp.b,
	})

	let round = 1
	let winner = null

	while (round <= MAX_ROUNDS && !winner) {
		for (const side of [first, second]) {
			const other = side === "a" ? "b" : "a"
			if (hp.a <= 0 || hp.b <= 0) break

			const attacker = pokemon[side]
			const defender = pokemon[other]
			const { damage, typeMult } = rollDamage(attacker, defender)

			hp[other] = Math.max(0, hp[other] - damage)

			log.push({
				type: "attack",
				side,
				text: `${capitalize(attacker.name)} attacks! ${capitalize(
					defender.name,
				)} takes ${damage} damage.${effectivenessNote(typeMult)}`,
				hpA: hp.a,
				hpB: hp.b,
			})

			if (hp[other] <= 0) {
				log.push({
					type: "faint",
					side: other,
					text: `${capitalize(defender.name)} fainted!`,
					hpA: hp.a,
					hpB: hp.b,
				})
				winner = side
				break
			}
		}
		round++
	}

	if (!winner) winner = "draw"

	log.push({
		type: "result",
		side: winner === "draw" ? null : winner,
		text:
			winner === "draw"
				? "Time's up — it's a draw!"
				: `${capitalize(pokemon[winner].name)} wins!`,
		hpA: hp.a,
		hpB: hp.b,
	})

	return { log, winner, maxHpA, maxHpB }
}
