import { useState } from "react"
import { PokeballIcon } from "./TypeIcon"

// Beberapa Pokemon (biasanya form/variant yang lebih baru banget) belum
// punya official artwork di PokeAPI — src-nya null atau link-nya putus.
// Daripada nampilin ikon broken-image bawaan browser, kita fallback ke
// ikon pokeball placeholder yang gayanya nyambung sama UI.
const PokemonImage = ({ src, alt = "", className, iconSize = 60 }) => {
	const [failed, setFailed] = useState(false)

	if (!src || failed) {
		return (
			<span
				className={`pokemon-image-fallback${className ? ` ${className}` : ""}`}
			>
				<PokeballIcon size={iconSize} />
			</span>
		)
	}

	return (
		<img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
	)
}

export default PokemonImage
