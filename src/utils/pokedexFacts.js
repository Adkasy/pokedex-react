// capture_rate PokeAPI: 3 (paling susah, mis. legendary) sampe 255
// (paling gampang, mis. Caterpie). Dikategoriin jadi label biar gak
// perlu mikirin artinya angka mentahnya.
export const getCatchDifficulty = (captureRate) => {
	if (captureRate == null) return null
	if (captureRate <= 45) return "Very Hard"
	if (captureRate <= 90) return "Hard"
	if (captureRate <= 150) return "Medium"
	if (captureRate <= 200) return "Easy"
	return "Very Easy"
}

export const AVERAGE_HUMAN_HEIGHT_M = 1.7

export const getSizeComparisonLabel = (pokemonHeightM) => {
	const ratio = pokemonHeightM / AVERAGE_HUMAN_HEIGHT_M

	if (ratio >= 1.3) return "Much taller than an average human"
	if (ratio >= 0.7) return "About the same height as an average human"
	return "Much shorter than an average human"
}
