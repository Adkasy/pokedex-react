# Pokedex React — Phase 1 Roadmap

> Project latihan + portofolio, jalan bareng materi React (`react-course.html`, topik 01-18).
> **Update 2026-08-06:** materi 01-18 udah dilewatin semua (17/Redux sengaja di-skip, kerasa overwhelming — reasonable call, ditunda). Materi 18 masih jalan paralel sambil ngoding project ini.
> **Update 2026-08-06 (v2):** disesuain ke daftar "fitur wajib" resmi dari materi course — jadi milestone di bawah bukan cuma tebakan gw lagi, tapi mapping langsung ke lesson yang udah lo pelajarin.
> Karena materi udah kelar duluan, Phase 1 sekarang statusnya **eksekusi/latihan**, bukan belajar konsep baru lagi — milestone di bawah ini fungsinya buat mastiin materi yang udah dipelajari beneran nempel pas dipake di project nyata, bukan cuma paham teori.
> Prinsip Phase 1 tetep sama: **ga muluk-muluk, no global state library dulu (Zustand/Redux).** Favorit tetep masuk Phase 1 tapi pakai `useLocalStorage` (local state yang di-persist), bukan Zustand — jadi gak melanggar prinsip itu.

---

## Fitur Wajib (dari materi course — jangan dikurangi)

Ini checklist resmi, bukan interpretasi gw. Tiap milestone di bawah = satu fitur ini + lesson terkait.

1. Daftar item dari API — lesson 08 + 14
2. Loading, error, dan **empty state** — lesson 07 + 14 (paling sering dilewatin pemula, paling kelihatan reviewer)
3. Pencarian/filter, idealnya pakai debounce — lesson 12 + 15
4. Halaman/panel detail — lesson 06 + 14
5. Favorit yang tersimpan (`useLocalStorage`) — lesson 15
6. Responsif di HP (CSS) — wajib, reviewer sering buka dari HP

---

## Cara pakai file ini

- Tiap milestone punya: lesson yang dipraktekin, Definition of Done, estimasi waktu.
- Kerjain urut dari M0. Milestone disusun supaya tiap fitur wajib punya slot sendiri yang jelas — gak digabung asal-asalan.
- Update kolom **Status** manual tiap kelar satu milestone (✅ / 🔄 / ⬜).
- Kalau mentok, itu sinyal balik ke lesson terkait di `react-course.html`, bukan lompat milestone.

| #         | Milestone                     | Fitur wajib # | Lesson  | Estimasi       | Status |
| --------- | ----------------------------- | ------------- | ------- | -------------- | ------ |
| M0        | Project shell                 | —             | 01-05   | 1-2 jam        | ⬜     |
| M1        | Component decomposition       | —             | 06      | 1-2 jam        | ⬜     |
| M2        | Fetch & render list dari API  | 1             | 08 + 14 | 2-4 jam        | ⬜     |
| M3        | Loading, error, empty state   | 2             | 07 + 14 | 1.5-3 jam      | ⬜     |
| M4        | Search/filter + debounce      | 3             | 12 + 15 | 2-4 jam        | ⬜     |
| M5        | Detail panel/halaman          | 4             | 06 + 14 | 3-5 jam        | ⬜     |
| M6        | Favorit via `useLocalStorage` | 5             | 15      | 2-3 jam        | ⬜     |
| M7        | Responsif HP                  | 6             | CSS     | 1.5-3 jam      | ⬜     |
| M8        | Polish + deploy               | —             | —       | 2-4 jam        | ⬜     |
| **Total** |                               |               |         | **~17-30 jam** |        |

> Karena materinya udah pernah dipelajari, milestone ini bisa dikerjain lebih rapet dari estimasi kalau emang lancar. Tapi tetep urut — tiap milestone numpuk di atas kode sebelumnya.

---

## M0 — Project Shell

**Lesson:** 01-05 (JSX, component, props dasar)

> **`PokemonCard` itu apa?** Komponen baru yang lo bikin sendiri (bukan dari React/library manapun) — tugasnya cuma nampilin **1** pokemon (gambar + nama) dari data yang dikasih lewat props. Dipisah jadi komponen sendiri biar bisa dipake berkali-kali buat tiap pokemon di grid, tanpa nulis ulang JSX yang sama tiap kali.

- [x] Bersihin boilerplate default Vite di `src/App.jsx`
- [x] Struktur folder: `src/components/` (tempat komponen kayak `PokemonCard`), `src/hooks/` (tempat custom hook yang bakal dibikin di M4 & M6)
- [x] Bikin `src/components/PokemonCard.jsx` — nerima props `name` + `image`, data masih hardcode (belum fetch API sama sekali di milestone ini)
- [x] Render beberapa `PokemonCard` di `App.jsx` dari array hardcode — manual satu-satu dulu, belum pakai `.map()` (itu baru di M1)

**Kelar kalau:** grid tampil dari data statis, belum ada API.

---

## M1 — Component Decomposition

**Lesson:** 06 (component composition)

> **`PokemonList` itu apa?** Komponen baru lagi (juga lo bikin sendiri) — bedanya sama `PokemonCard`, `PokemonList` gak nampilin 1 pokemon, tapi nerima **array** pokemon lewat props terus `.map()`-in jadi banyak `<PokemonCard />`. Gunanya: misahin logic "loop data jadi card" dari `App.jsx`, biar `App.jsx` tinggal manggil satu baris tanpa perlu tau detail cara render-nya.
>
> ```jsx
> // src/components/PokemonList.jsx
> function PokemonList({ data }) {
> 	return (
> 		<div className="grid">
> 			{data.map((p) => (
> 				<PokemonCard key={p.name} name={p.name} image={p.image} />
> 			))}
> 		</div>
> 	)
> }
> ```
>
> Setelah ini ada, `App.jsx` cukup: `<PokemonList data={pokemonData} />` — gak ada lagi JSX card yang numpuk di `App.jsx`.

- [x] Pecah `PokemonCard` jadi lebih granular kalau perlu (misal komponen kecil khusus buat badge type — opsional, skip dulu kalau belum kepake)
- [x] Bikin `src/components/PokemonList.jsx` — nerima array `data` via props, `.map()` tiap item jadi `<PokemonCard />`
- [x] Ganti isi `App.jsx` jadi cuma manggil `<PokemonList data={...} />` — hapus JSX card manual yang ditulis di M0

**Kelar kalau:** rendering list udah lewat satu komponen dedicated (`PokemonList`), `App.jsx` gak ada lagi JSX card yang ditulis langsung.

---

## M2 — Fetch & Render List dari API _(Fitur wajib #1)_

**Lesson:** 08 (fetch/data loading) + 14 (kemungkinan custom hook / API layer)

- [x] Fetch beneran ke [PokeAPI](https://pokeapi.co/) (`GET /pokemon?limit=20`)
- [x] State `pokemonList` via `useState([])`, fetch di `useEffect`
- [x] Ganti data hardcode M0 jadi hasil fetch

**Kelar kalau:** grid nongol dari data API asli.

---

## M3 — Loading, Error, Empty State _(Fitur wajib #2)_

**Lesson:** 07 + 14

- [x] State `isLoading`, `error`
- [x] Tampilan beda 4 kondisi: loading / error / **empty (hasil 0, misal dari search)** / success
- [x] Tes manual ketiga-empatnya beneran kepanggil (jangan cuma asumsi) — matiin network, typo URL sengaja, search kata random buat mancing empty state

**Kelar kalau:** keempat state keliatan jelas beda, udah dites manual satu-satu. Ini poin yang paling gampang dilewatin — jangan buru-buru ke M4 sebelum ini beneran solid.

---

## M4 — Search/Filter + Debounce _(Fitur wajib #3)_

**Lesson:** 12 (controlled input/filter) + 15 (custom hook `useDebounce`)

> **`useDebounce` itu apa?** Custom hook — artinya fungsi biasa yang lo bikin sendiri, namanya diawali `use` karena dia makai `useState`/`useEffect` di dalemnya. Gunanya: nunda eksekusi sampe user **berhenti** ngetik sesaat (misal 300ms), biar filter gak jalan di tiap huruf yang diketik (yang bisa bikin berat kalau listnya gede). Pola umumnya:
>
> ```js
> // src/hooks/useDebounce.js
> import { useState, useEffect } from "react"
>
> export function useDebounce(value, delay = 300) {
> 	const [debounced, setDebounced] = useState(value)
> 	useEffect(() => {
> 		const timer = setTimeout(() => setDebounced(value), delay)
> 		return () => clearTimeout(timer) // batal timer lama tiap value berubah lagi
> 	}, [value, delay])
> 	return debounced
> }
> ```
>
> Cara pakai: `const debouncedSearch = useDebounce(searchTerm, 300);` — filter list pake `debouncedSearch`, bukan `searchTerm` mentah.

- [x] Input search, controlled component
- [x] Filter list dari `pokemonList` + search term — derived value, jangan bikin state terpisah buat hasil filter
- [x] Bikin `useDebounce` (custom hook, lesson 15) biar filter gak jalan tiap ketikan — nunggu jeda dikit dulu

**Kelar kalau:** ngetik di search box gak bikin re-render/filter tiap huruf, ada jeda (debounce) sebelum hasil ke-update. Ini juga yang bakal mancing empty state di M3 kalau search-nya gak match apa-apa.

---

## M5 — Detail Panel/Halaman _(Fitur wajib #4)_

**Lesson:** 06 (composition) + 14 (fetch by param)

> **"Conditional render state" itu apa?** Maksudnya: belum pakai routing beneran (belum ada URL berubah kayak `/pokemon/5`). Caranya cuma nyimpen state di `App.jsx`, misal `const [selectedPokemon, setSelectedPokemon] = useState(null)`. Pas card diklik, `setSelectedPokemon(nama)`. Terus di JSX: `{selectedPokemon ? <PokemonDetail name={selectedPokemon} /> : <PokemonList data={...} />}` — tampilin salah satu tergantung state-nya, bukan dua-duanya sekaligus. `PokemonDetail` sendiri adalah komponen baru lagi (pola sama kayak `PokemonCard`/`PokemonList`), tugasnya fetch & nampilin data lengkap 1 pokemon.

- [x] Klik card → buka detail (conditional render state di `App.jsx` dulu, belum perlu React Router)
- [x] Fetch detail spesifik (`GET /pokemon/{id}`) pas detail dibuka — pakai pola fetch yang sama kayak M2
- [x] Tampilin stats, type, height/weight, sprite gede
- [x] Detail panel juga butuh loading/error state sendiri (reuse pola dari M3)

**Kelar kalau:** dari grid bisa masuk detail satu pokemon dengan data fresh, bisa balik ke grid.

---

## M6 — Favorit via `useLocalStorage` _(Fitur wajib #5)_

**Lesson:** 15 (custom hook `useLocalStorage`)

> **`useLocalStorage` itu apa?** Custom hook lain lagi — dari luar dipake PERSIS kayak `useState` biasa (`const [favorites, setFavorites] = useLocalStorage("favorites", [])`), bedanya tiap `setFavorites` dipanggil, value-nya otomatis kesimpen juga ke `localStorage` browser. Efeknya: refresh halaman, data gak ilang. Pola dasarnya:
>
> ```js
> // src/hooks/useLocalStorage.js
> import { useState, useEffect } from "react"
>
> export function useLocalStorage(key, initialValue) {
> 	const [value, setValue] = useState(() => {
> 		const stored = localStorage.getItem(key)
> 		return stored ? JSON.parse(stored) : initialValue
> 	})
> 	useEffect(() => {
> 		localStorage.setItem(key, JSON.stringify(value))
> 	}, [key, value])
> 	return [value, setValue]
> }
> ```

- [x] Bikin custom hook `useLocalStorage` (kalau belum ada dari lesson 15, bikin sendiri pakai pola di atas)
- [x] Tombol favorite (♥) di `PokemonCard` dan di detail panel
- [x] List favorit persist — refresh browser, favorit gak ilang

**Catatan penting:** ini TETEP local state (via hook), bukan Zustand. Karena tree komponennya masih dangkal (App → List/Detail → Card), props/lifted state masih cukup. Zustand baru relevan kalau nanti struktur project udah lebih kompleks (banyak halaman independen yang butuh akses favorit tanpa lift state jauh) — itu baru trigger buat Phase 2.

**Kelar kalau:** toggle favorite kerja di card & detail, dan persist setelah reload.

---

## M7 — Responsif di HP _(Fitur wajib #6)_

**Lesson:** CSS (bukan lesson React spesifik)

> Dikerjain bareng Claude (di luar materi React lo) — plain CSS, dipisah ke `App.css` + CSS variables di `index.css` (warna, dark mode). Grid pokemon pake `grid-template-columns: repeat(auto-fill, minmax(...))` biar otomatis nyesuain jumlah kolom tanpa media query manual per breakpoint. Badge warna per type pake palette dari [POKEAPI-STARTER-KIT.md](POKEAPI-STARTER-KIT.md#4-kit-siap-pakai--warna-per-type).

- [x] Cek grid, search bar, detail panel di lebar layar HP (~375-480px) — breakpoint di `App.css`
- [x] Fix layout yang break — grid columns ngecil, gambar/padding card ngecil, detail panel full-width di mobile
- [x] Semua inline `style={{...}}` dipindah jadi `className` + CSS file (lebih rapi, lebih gampang di-maintain)

**Kelar kalau:** semua fitur wajib (1-5) tetep kepake normal di lebar layar HP, gak ada elemen kepotong/overflow horizontal.

---

## M8 — Polish + Deploy

**Lesson:** — (praktek "siap portofolio", bukan materi baru)

- [x] Cek semua komponen rapi (gak ada `console.log` nyampah, props jelas) — rename variabel/fungsi biar konsisten (`onSelectPokemon`/`handleSelectPokemon`, dll), `selectedPokemon` dirapiin dari array jadi single object/`null`, hapus komponen `Button.jsx` yang gak kepake, hapus dead code
- [x] README: isinya apa, tech stack, cara run lokal — lihat [README.md](../README.md)
- [ ] Deploy ke Vercel
- [x] `.gitignore` dirapiin, project di-push ke GitHub

**Kelar kalau:** ada link live yang bisa dipamerin, README jelas buat orang yang baca sekilas (termasuk reviewer/interviewer).

---

## Di luar Phase 1 (jangan dikerjain dulu)

Bukan karena materinya belum dipelajari (udah, sampe 18), tapi biar Phase 1 tetep fokus ke 6 fitur wajib dan kelar sampe deploy:

- **Zustand/global state** — baru dipake kalau struktur project udah lebih kompleks dari yang favorit-via-localStorage bisa handle (misal: halaman "My Favorites" terpisah yang jauh dari tree utama)
- Pagination proper / infinite scroll
- React Router beneran (multi-page, gantiin conditional-render di M5)
- Dark mode / theming
- TypeScript migration
- Testing (unit test komponen)
- Redux — tetep di-park, gak perlu dikejar kecuali ada alasan spesifik (misal lowongan kerja yang eksplisit minta)

---

## Log Progress

_(update manual tiap kelar milestone — tanggal + catatan singkat kalau ada yang bikin stuck)_

- 2026-08-06: Phase 1 planning dibuat.
- 2026-08-06: Plan direvisi (v2) — disesuain ke daftar fitur wajib resmi dari materi course (list, loading/error/empty, search+debounce, detail, favorit useLocalStorage, responsive). Favorit dipindah masuk Phase 1 (pakai localStorage, bukan Zustand), jadi total milestone 6 → 9 (M0-M8).
