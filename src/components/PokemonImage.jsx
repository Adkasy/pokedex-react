import { useEffect, useState } from "react"
import { PokeballIcon } from "./TypeIcon"

// Beberapa Pokemon (biasanya form/variant yang lebih baru banget) belum
// punya official artwork di PokeAPI — src-nya null atau link-nya putus.
// Daripada nampilin ikon broken-image bawaan browser, kita fallback ke
// ikon pokeball placeholder yang gayanya nyambung sama UI. Placeholder
// yang sama juga dipake pas gambarnya masih di-download (misal abis pilih
// Pokemon baru yang gambarnya belum pernah ke-load browser) — biar gak
// ada jeda kosong sebelum gambarnya tiba-tiba "muncul begitu aja".
const PokemonImage = ({ src, alt = "", className, iconSize = 58 }) => {
	const [status, setStatus] = useState(src ? "loading" : "failed") // "loading" | "loaded" | "failed"

	// nyimpen `src` yang "udah dilihat" render sebelumnya — dipake buat
	// reset status ke "loading" begitu src-nya ganti (misal ganti pilihan
	// Pokemon di halaman compare), TANPA effect — pattern "adjusting state
	// on a prop change" yang sama kayak di PokemonDetailPage/Pagination
	const [prevSrc, setPrevSrc] = useState(src)
	if (src !== prevSrc) {
		setPrevSrc(src)
		setStatus(src ? "loading" : "failed")
	}

	// Download gambarnya duluan di background (pake `new Image()`, bukan
	// langsung taro di <img> yang dirender) — biar kita tau persis kapan
	// dia kelar/gagal, baru render <img> ASLI-nya begitu udah siap.
	useEffect(() => {
		if (!src) return

		let cancelled = false

		const image = new Image()
		image.src = src
		image.onload = () => {
			if (!cancelled) setStatus("loaded")
		}
		image.onerror = () => {
			if (!cancelled) setStatus("failed")
		}

		// kalau `src`-nya keburu ganti lagi (misal ganti pilihan Pokemon)
		// sebelum gambar lama ini kelar, hasil loadnya jangan dipake lagi
		return () => {
			cancelled = true
		}
	}, [src])

	if (status !== "loaded") {
		return (
			<span
				className={`pokemon-image-fallback${status === "loading" ? " is-loading" : ""}${className ? ` ${className}` : ""}`}
			>
				<PokeballIcon size={iconSize} />
			</span>
		)
	}

	return <img className={className} src={src} alt={alt} />
}

export default PokemonImage
