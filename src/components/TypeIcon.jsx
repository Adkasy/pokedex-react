import { CgPokemon } from "react-icons/cg"
import { IoMdMan } from "react-icons/io"
import { MdCompareArrows } from "react-icons/md"

const PATHS = {
	normal: "M12 3a9 9 0 100 18 9 9 0 000-18z",
	fire: "M12 2c-1 3-4 5-4 9a4 4 0 008 0c0-1.5-1-2.5-1-4 0 1-1.5 2-1.5 3.5A2.5 2.5 0 0111 8c0-2 2-3 1-6z",
	water: "M12 2C8 8 5 12 5 15a7 7 0 0014 0c0-3-3-7-7-13z",
	grass: "M20 4C10 4 4 10 4 20c8 0 14-6 14-14 1-1 2-1 2-2z",
	electric: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
	ice: "M12 2v20M4.5 7l15 10M19.5 7l-15 10",
	fighting:
		"M7 11V7a2 2 0 114 0v3m0-2a2 2 0 114 0v2m0-1a2 2 0 114 0v5a6 6 0 01-12 0v-2L4.5 12A1.5 1.5 0 017 10.3",
	poison:
		"M9 2h6v4.5c2.5 1.3 4 3.8 4 6.7A7 7 0 0112 20a7 7 0 01-7-6.8c0-2.9 1.5-5.4 4-6.7V2z",
	ground: "M2 20l7-14 4 7 3-5 6 12H2z",
	flying:
		"M2 14c4-6 10-10 20-10-3 6-8 9-13 9 3 1 6 1 9 0-3 4-8 6-13 5 1-1 2-2 2-3-2 0-4 0-5-1z",
	psychic:
		"M12 5c5 0 9 4.5 9 7s-4 7-9 7-9-4.5-9-7 4-7 9-7zm0 4a3 3 0 100 6 3 3 0 000-6z",
	bug: "M12 3v3M8 6l1.5 2M16 6l-1.5 2M6 12H3M21 12h-3M6 17l-2 2M20 17l2 2M8 9h8a4 4 0 014 4v2a4 4 0 01-4 4H8a4 4 0 01-4-4v-2a4 4 0 014-4z",
	rock: "M5 17l3-10 4 3 3-6 4 13H5z",
	ghost:
		"M12 2a7 7 0 00-7 7v11l2.5-2 2.5 2 2-2 2 2 2.5-2 2.5 2V9a7 7 0 00-7-7zM9.5 10a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zm5 0a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z",
	dragon:
		"M2 12c3-6 8-9 12-9-1 3-1 5 0 7 2-2 5-3 8-2-3 3-4 6-4 9-3 0-6-1-8-3 0 2 1 4 2 5-4 0-8-3-10-7z",
	dark: "M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5z",
	steel:
		"M12 2l2 3.5 4-1 -0.5 4L21 10l-3.5 2 0.5 4-4-1L12 18l-2-3.5-4 1 0.5-4L3 10l3.5-2-0.5-4 4 1L12 2z",
	fairy: "M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
}

// Path-path di atas digambar tangan, jadi gak semuanya beneran ngisi
// tengah-tengah viewBox 0-24-nya (misal "fire" itu ternyata numpuk di
// bagian atas doang) — kalau viewBox dibiarin "0 0 24 24" polos, hasil
// render-nya keliatan ketinggian/kerendahan pas disejajarin sama teks
// di sebelahnya (align-items:center cuma nyeimbangin BOX-nya, bukan
// "beratnya" gambar di dalem box itu). Angka-angka ini diukur langsung
// dari getBBox() tiap path di browser (pusat gambarnya - 12, dibulatin),
// dipake buat geser viewBox-nya per type biar isinya kebaca center.
const VIEWBOX_Y_OFFSETS = {
	fire: -3.5,
	fighting: 0.5,
	poison: -1,
	ground: 1,
	flying: -0.87,
	bug: -1,
	rock: -1.5,
	ghost: -1,
	dragon: -1,
	dark: 0.34,
	steel: -2,
	fairy: -2,
}

const TypeIcon = ({ type, size = 12 }) => {
	const d = PATHS[type]
	if (!d) return null

	const yOffset = VIEWBOX_Y_OFFSETS[type] ?? 0

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 ${yOffset} 24 24`}
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path
				d={d}
				fill={
					["normal", "fighting", "ghost", "fairy"].includes(type)
						? "currentColor"
						: "none"
				}
			/>
		</svg>
	)
}

export const StarIcon = ({ filled = false, size = 16 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill={filled ? "currentColor" : "none"}
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z" />
	</svg>
)

export const PokeballIcon = ({ size = 120 }) => (
	<CgPokemon size={size} aria-hidden="true" />
)

export const HumanIcon = ({ size = 60 }) => (
	<IoMdMan size={size} aria-hidden="true" />
)

export const CompareIcon = ({ size = 16 }) => (
	<MdCompareArrows size={size} aria-hidden="true" />
)

export const SearchIcon = ({ size = 18 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="7" />
		<path d="M21 21l-4.35-4.35" />
	</svg>
)

export const PlayIcon = ({ size = 14 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke="none"
		aria-hidden="true"
	>
		<path d="M7 4.5v15l13-7.5-13-7.5z" />
	</svg>
)

export const WaveformIcon = ({ playing = false, size = 14, bars = 60 }) => (
	<span
		className={`waveform${playing ? " is-playing" : ""}`}
		style={{ height: size }}
		aria-hidden="true"
	>
		{Array.from({ length: bars }).map((_, i) => (
			<span key={i} style={{ animationDelay: `${(i % 5) * 0.09}s` }} />
		))}
	</span>
)

export const CloseIcon = ({ size = 14 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M18 6L6 18M6 6l12 12" />
	</svg>
)

export default TypeIcon
