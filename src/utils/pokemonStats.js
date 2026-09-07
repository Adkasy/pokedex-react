// PokeAPI ngasih stats sebagai array `[{ base_stat, stat: { name } }, ...]`
// bukan object biasa, jadi butuh `find` tiap kali mau ambil 1 stat
// spesifik (misal cuma butuh "speed"-nya doang) — dipake di battle
// simulator & halaman compare, jadi ditaro di sini biar gak duplikat.
export const getStat = (pokemon, statName) =>
	pokemon.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0

export const getTotalStats = (pokemon) =>
	pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)
