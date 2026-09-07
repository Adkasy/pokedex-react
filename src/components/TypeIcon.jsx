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

// Icon-icon di atas itu bentuknya gak simetris (droplet buat water,
// bulu buat flying, dst) — bounding box-nya udah center (dicek pake
// getBBox), TAPI "berat" visualnya numpuk di salah satu sisi (droplet
// misalnya, meruncing di atas & ngegembung di bawah, jadi keliatan
// nunduk walau box-nya center). Ini bikin icon-nya keliatan gak
// sejajar sama teks di sebelahnya walau padahal geometrinya bener.
//
// Angka-angka ini bukan bounding-box biasa, tapi PUSAT MASSA visualnya
// — dirender ke <canvas>, dijumlahin tiap pixel yang keisi (alpha>10)
// dibagi total, dibandingin ke titik tengah geometrisnya. Positif =
// pusat massanya di bawah tengah (icon keliatan "berat ke bawah"),
// negatif = di atas. Dipake buat nge-geser icon-nya dikit ke arah
// berlawanan (translateY) biar keliatan seimbang di mata, bukan cuma
// bener di atas kertas.
const OPTICAL_OFFSET_RATIOS = {
	fire: 0.058,
	water: 0.1,
	electric: -0.068,
	grass: -0.035,
	fighting: 0.031,
	poison: 0.018,
	ground: 0.021,
	flying: -0.107,
	psychic: 0.008,
	bug: 0.011,
	rock: 0.041,
	ghost: 0.003,
	dragon: 0.046,
	steel: -0.027,
	fairy: 0.021,
}

const TypeIcon = ({ type, size = 12 }) => {
	const Icon = TYPE_ICON_COMPONENTS[type]
	if (!Icon) return null

	const offsetRatio = OPTICAL_OFFSET_RATIOS[type] ?? 0
	const style = offsetRatio
		? { transform: `translateY(${-offsetRatio * size}px)` }
		: undefined

	return <Icon size={size} style={style} aria-hidden="true" />
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
