# PokeAPI Starter Kit — Zero Dokumentasi Required

> Tujuan file ini: lo bisa mulai ngoding M2 dalam 5 menit tanpa buka [pokeapi.co/docs](https://pokeapi.co/docs/v2) sama sekali. Semua yang biasanya bikin orang bolak-balik ke dokumentasi udah dirangkum di sini: endpoint mana buat apa, bentuk response-nya kayak gimana, gotcha yang bakal lo temuin, dan kode siap-pakai.
>
> Kalau ada yang gak ke-cover di sini dan lo kepaksa buka dokumentasi, catet di bagian bawah biar file ini makin lengkap buat sesi berikutnya.

---

## 1. Fakta Dasar (yang perlu lo tau sebelum mulai)

- **Base URL:** `https://pokeapi.co/api/v2`
- **Gak butuh API key / auth sama sekali.** Langsung `fetch()`, selesai.
- **CORS udah diizinin** — bisa langsung dipanggil dari browser (dari `localhost:5173` juga aman), gak perlu proxy/backend.
- **Read-only.** Semua request GET, gak ada create/update/delete.
- **Rate limit:** fair-use, gak ada angka pasti resmi, tapi buat project latihan skala kecil (bukan nembak ribuan request/detik) aman-aman aja.
- **Total Pokemon:** ~1300-an (termasuk varian/forms). Buat grid awal, cukup ambil yang ID 1-151 (Gen 1) atau 1-20 biar ringan & familiar.

---

## 2. Endpoint yang Bakal Lo Pake (cuma ini, gak lebih)

| Kebutuhan | Endpoint | Dipake di milestone |
|---|---|---|
| List pokemon (nama + url doang) | `GET /pokemon?limit=20&offset=0` | M2 |
| Detail 1 pokemon (stats, type, sprite) | `GET /pokemon/{id-atau-nama}` | M2, M5 |
| Semua nama pokemon sekaligus (buat search) | `GET /pokemon?limit=100000&offset=0` | M4 |

Itu doang. Lo gak butuh endpoint `/pokemon-species`, `/evolution-chain`, `/type`, dll buat Phase 1 — itu semua di luar scope 6 fitur wajib, jangan kepancing eksplor ke situ dulu.

---

## 3. Bentuk Response (biar gak kaget)

### `GET /pokemon?limit=20&offset=0`

Response ini **RINGAN tapi GAK ada gambar/type**. Cuma nama + link ke detail:

```json
{
  "count": 1302,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  "previous": null,
  "results": [
    { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" },
    { "name": "ivysaur", "url": "https://pokeapi.co/api/v2/pokemon/2/" }
  ]
}
```

> **Gotcha #1 (paling penting):** endpoint list ini GAK punya gambar atau type. Buat nampilin card yang ada gambarnya, lo HARUS fetch detail tiap pokemon satu-satu (lihat section 5, sudah disediain fungsinya).

### `GET /pokemon/{id-atau-nama}`

Ini yang punya semua data buat card & detail. Dipangkas cuma field yang bakal lo pake:

```json
{
  "id": 1,
  "name": "bulbasaur",
  "height": 7,
  "weight": 69,
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    "other": {
      "official-artwork": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
      },
      "home": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/1.png"
      }
    }
  },
  "types": [
    { "slot": 1, "type": { "name": "grass" } },
    { "slot": 2, "type": { "name": "poison" } }
  ],
  "stats": [
    { "base_stat": 45, "stat": { "name": "hp" } },
    { "base_stat": 49, "stat": { "name": "attack" } },
    { "base_stat": 49, "stat": { "name": "defense" } },
    { "base_stat": 65, "stat": { "name": "special-attack" } },
    { "base_stat": 65, "stat": { "name": "special-defense" } },
    { "base_stat": 45, "stat": { "name": "speed" } }
  ]
}
```

**Field yang bakal lo pake terus:**
- `sprites.other["official-artwork"].front_default` → gambar gede bagus (pakai ini buat card & detail, bukan `sprites.front_default` yang pixelated kecil)
- `types[].type.name` → array of string, misal `["grass", "poison"]`
- `stats[].stat.name` + `stats[].base_stat` → buat detail panel
- `height` (dalam desimeter, bagi 10 buat jadi meter) dan `weight` (dalam hectogram, bagi 10 buat jadi kg)

> **Gotcha #2:** `height` dan `weight` satuannya aneh. `height: 7` artinya 0.7 meter. `weight: 69` artinya 6.9 kg. Bagi 10 dulu sebelum ditampilin.

---

## 4. Kit Siap Pakai — Warna per Type

Reviewer bakal notice kalau badge type-nya polos abu-abu semua. Ini palette warna standar yang dipake hampir semua Pokedex clone, tinggal copy:

```js
// src/constants/typeColors.js
export const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export function getTypeColor(typeName) {
  return TYPE_COLORS[typeName] ?? "#777777"; // fallback abu-abu kalau type gak dikenal
}
```

Pakainya: `<span style={{ backgroundColor: getTypeColor(type) }}>{type}</span>`

---

## 5. Kit Siap Pakai — API Layer

Bikin file ini, langsung dipake di M2/M4/M5 tanpa mikir ulang cara fetch-nya:

```js
// src/api/pokeapi.js
const BASE_URL = "https://pokeapi.co/api/v2";

// M2: list pokemon buat grid awal (default 20 pertama)
export async function getPokemonList(limit = 20, offset = 0) {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`Gagal ambil list pokemon (status ${res.status})`);
  const data = await res.json();
  return data.results; // array of { name, url }
}

// M2 & M5: detail satu pokemon — nerima nama ATAU id, dua-duanya jalan
export async function getPokemonDetail(nameOrId) {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error(`Pokemon "${nameOrId}" gak ketemu (status ${res.status})`);
  return res.json();
}

// M2: helper buat langsung dapetin list YANG UDAH ada gambar & type-nya
// (nembak N request sekaligus pakai Promise.all, dipake buat grid awal)
export async function getPokemonListWithDetails(limit = 20, offset = 0) {
  const list = await getPokemonList(limit, offset);
  const details = await Promise.all(
    list.map((p) => getPokemonDetail(p.name))
  );
  return details;
}

// M4: dapetin SEMUA nama pokemon sekaligus (ringan, ~1300 nama doang, gak ada gambar)
// Fetch ini SEKALI di awal, simpen di state, dipake buat search client-side.
export async function getAllPokemonNames() {
  const res = await fetch(`${BASE_URL}/pokemon?limit=100000&offset=0`);
  if (!res.ok) throw new Error("Gagal ambil daftar nama pokemon");
  const data = await res.json();
  return data.results; // [{ name, url }, ...] — pakai buat filter, fetch detail on-demand pas match
}
```

> **Gotcha #3 (kenapa `getPokemonListWithDetails` ada):** karena endpoint list gak punya gambar (Gotcha #1), buat nampilin grid yang ada gambarnya lo butuh fetch detail per pokemon. Daripada lo mikir ulang cara nge-loop-nya pas ngerjain M2, fungsi ini udah nyiapin — tinggal `await getPokemonListWithDetails(20, 0)` dan langsung dapet array lengkap.

### Cara pakai di komponen (contoh buat M2)

```jsx
import { useEffect, useState } from "react";
import { getPokemonListWithDetails } from "../api/pokeapi";

function usePokemonList(limit = 20, offset = 0) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getPokemonListWithDetails(limit, offset)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [limit, offset]);

  return { data, isLoading, error };
}
```

Ini persis pola yang bakal lo pake di M3 (loading/error/empty) — tinggal tambah kondisi `data.length === 0` buat empty state.

---

## 6. Kit Siap Pakai — Search Tanpa Ribet (buat M4)

PokeAPI **gak punya endpoint search**. Gak ada `GET /pokemon?search=char`. Jadi caranya:

1. Sekali di awal, fetch `getAllPokemonNames()` → simpen ~1300 nama di state (payload-nya kecil, gak ada gambar, aman)
2. Filter di client pakai `.filter()` biasa berdasarkan `name.includes(searchTerm)`
3. Fetch detail (gambar dll) cuma buat hasil yang match & lagi ditampilin — jangan fetch detail buat 1300-nya sekaligus

```js
const filtered = allNames.filter((p) =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

Debounce (lesson 15) dipasang di `searchTerm`-nya, bukan di fetch — karena fetch besar cuma sekali di awal, yang perlu di-debounce itu proses filter tiap ketikan biar gak berat kalau nanti listnya gede.

---

## 7. Gotcha Lain yang Sering Bikin Bingung

- **ID gak selalu berurutan rapi.** Setelah ID ~1010, ada varian/mega/gmax dengan ID acak (10001+). Buat Phase 1, aman batasin ke ID 1-151 atau 1-251 aja biar gak ketemu data aneh.
- **Beberapa pokemon punya `sprites.other["official-artwork"].front_default` yang `null`** (jarang, tapi ada di beberapa varian). Selalu siapin fallback: `sprite ?? "/fallback-image.png"` atau tampilin placeholder.
- **Nama pokemon di API kadang beda format dari nama umum** — misal Nidoran jantan/betina jadi `nidoran-m` / `nidoran-f`, Mr. Mime jadi `mr-mime`. Kalau nemu kasus ini pas testing, jangan panik, itu emang formatnya begitu.
- **`getPokemonListWithDetails` makin lambat kalau `limit` gede** karena tiap pokemon = 1 request terpisah (`Promise.all` nembak paralel, tapi tetep 20+ request sekaligus). Buat awal, `limit=20` udah pas. Kalau nanti mau nambah pagination "Load More", tambah offset-nya, jangan naikin limit jadi 100+ sekaligus.

---

## 8. Kalau Ternyata Butuh Buka Dokumentasi Juga

File ini sengaja dibatesin ke yang kepake di 6 fitur wajib Phase 1. Kalau nanti (Phase 2+) butuh evolution chain, ability detail, generation filter, dll — itu baru saatnya buka [pokeapi.co/docs/v2](https://pokeapi.co/docs/v2/), karena scope-nya udah di luar starter kit ini.

**Catatan tambahan (isi manual kalau nemu hal baru yang berguna buat sesi berikutnya):**

-
