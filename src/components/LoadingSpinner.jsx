import { PokeballIcon } from "./TypeIcon"

// Pokeball yang mantul-mantul + ngerotasi dikit, plus bayangan di bawahnya
// yang ngembang-mengecil ngikutin ketinggian — dipake ganti teks
// "Loading…" polos di mana-mana biar lebih hidup.
const LoadingSpinner = ({ label = "Loading…", size = 40 }) => (
	<div className="loading-spinner">
		<span className="loading-spinner-ball">
			<PokeballIcon size={size} />
		</span>
		<span className="loading-spinner-shadow" />
		{label && <p className="loading-spinner-label">{label}</p>}
	</div>
)

export default LoadingSpinner
