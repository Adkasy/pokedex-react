import { CgPokemon } from "react-icons/cg"
import { IoMdMan } from "react-icons/io"
import { MdCompareArrows } from "react-icons/md"
import {
	GiCircle,
	GiFlame,
	GiWaterDrop,
	GiPowerLightning,
	GiOakLeaf,
	GiSnowflake1,
	GiFist,
	GiPoisonBottle,
	GiEarthCrack,
	GiFeather,
	GiThirdEye,
	GiBeetleShell,
	GiRock,
	GiGhost,
	GiDragonHead,
	GiMoon,
	GiMetalBar,
	GiFairyWings,
} from "react-icons/gi"

// Semuanya dari 1 icon set doang (Game Icons, react-icons/gi) biar
// gaya gambarnya seragam antar type — dulu ini custom SVG gambar
// tangan sendiri-sendiri per type, ganti ke library biar konsisten
// & udah battle-tested (proporsinya emang didesain buat kebaca jelas
// di ukuran kecil, gak kaya path buatan sendiri yang ternyata banyak
// yang gak center).
const TYPE_ICON_COMPONENTS = {
	normal: GiCircle,
	fire: GiFlame,
	water: GiWaterDrop,
	electric: GiPowerLightning,
	grass: GiOakLeaf,
	ice: GiSnowflake1,
	fighting: GiFist,
	poison: GiPoisonBottle,
	ground: GiEarthCrack,
	flying: GiFeather,
	psychic: GiThirdEye,
	bug: GiBeetleShell,
	rock: GiRock,
	ghost: GiGhost,
	dragon: GiDragonHead,
	dark: GiMoon,
	steel: GiMetalBar,
	fairy: GiFairyWings,
}

const TypeIcon = ({ type, size = 12 }) => {
	const Icon = TYPE_ICON_COMPONENTS[type]
	if (!Icon) return null

	return <Icon size={size} aria-hidden="true" />
}

// icon + nama type dalem 1 pill — dipake di mana-mana (card, compare,
// detail), jadi disatuin di sini daripada nulis ulang <span
// className="type-badge"><TypeIcon />{name}</span> di tiap file. Nama
// type-nya dibungkus <span> sendiri (bukan text node polos) soalnya
// butuh nudge dikit lewat CSS (.type-badge-label) — tanpa itu teksnya
// keliatan ~0.5px lebih naik dari icon-nya (font metrics, bukan bug
// CSS), meski line-height udah di-set 1.
export const TypeBadge = ({ type, size = 12 }) => (
	<span className="type-badge">
		<TypeIcon type={type} size={size} />
		<span className="type-badge-label">{type}</span>
	</span>
)

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
