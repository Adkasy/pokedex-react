# Pokedex React

A Pokedex web app built with React + Vite, using live data from [PokeAPI](https://pokeapi.co/). Built as a practice/portfolio project while learning React fundamentals — components, hooks, custom hooks, derived state, client-side routing, URL-synced state, global state with Zustand, and a fair amount of animation/CSS along the way.

**Live demo:** [pokedex-react-adkasy.vercel.app](https://pokedex-react-adkasy.vercel.app/)

<!--
Screenshots — drop PNGs in docs/screenshots/ and uncomment:

## Screenshots

| Grid | Detail | Compare + Battle |
| --- | --- | --- |
| ![Grid view](docs/screenshots/grid.png) | ![Detail view](docs/screenshots/detail.png) | ![Battle simulator](docs/screenshots/battle.png) |
-->

## Features

### Pokedex

- **Full PokeAPI dataset** — every Pokemon (~1350+, including regional forms, Mega/Gigantamax, costumes) is searchable and browsable, not just a fixed slice. A lightweight index (id/name/artwork URL) loads once up front; full detail (stats, types, abilities...) is fetched lazily per-Pokemon only when it's actually needed (visible on the current page, opened in detail, filtered by type, etc.), so the initial load stays fast
- **Search** — debounced, filters by name across the whole dataset
- **Filter by type** — multi-select type chips, backed by PokeAPI's `/type/{name}` endpoint rather than needing every Pokemon's detail up front
- **Pagination** — numbered page buttons (with `…` for gaps) plus a "jump to page" input for large ranges
- **URL-synced state** — search, type filter, page, and compare picks all live in the URL query string, so refreshing or sharing a link preserves the exact view
- **Detail page** — stats, height/weight, abilities, Pokédex flavor text, catch difficulty, a to-scale size comparison against an average human, evolution chain (handles branching chains like Eevee's), and prev/next navigation (arrow buttons or ←/→ keyboard) through the whole dataset
- **Favorites** — toggle from any card or the detail page, persisted in `localStorage`, with their own `/favorites` page
- **Pokemon cries** — play a Pokemon's actual cry from its card or its detail page (only one plays at a time app-wide)
- **Compare mode** (`/compare`) — pick two Pokemon and see them head-to-head: stats as tug-of-war bars, a searchable combobox picker, a swap button, and a "random matchup" shuffle
- **Battle simulator** — inside Compare, simulate a turn-based 1v1 battle between the two picks: speed decides who moves first, damage factors in the real type chart + a critical-hit chance, HP bars update live, a chat-style log narrates each hit, and a fullscreen "Battle Begin!" flash + synthesized sound effects (Web Audio API, no audio files) bookend the fight
- **404 page** — any unknown route falls back to a proper not-found page
- **Responsive layout** — down to mobile widths across grid, detail, compare, and battle
- **Light/dark mode** — follows the OS theme automatically
- **Loading spinner** — a bouncing pokeball (not just a "Loading…" string) wherever data's being fetched, plus skeleton cards for grid slots still loading their detail

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) — client-side routing + `useSearchParams` for URL-synced state
- [Zustand](https://zustand.docs.pmnd.rs/) — the Pokemon data store (index + on-demand detail/type caches), favorites (persisted), and the cry-player store
- [react-icons](https://react-icons.github.io/react-icons/) — mixed with a few hand-rolled inline SVGs for type icons
- Plain CSS (custom properties for theming incl. light/dark, keyframe animations for the battle simulator and loading spinner)
- Web Audio API — synthesized sound effects (favorite toggle, victory fanfare, battle-start sword clash) with no audio assets
- [PokeAPI](https://pokeapi.co/) — no API key required
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — unit tests

## Getting started

```bash
git clone https://github.com/Adkasy/pokedex-react.git
cd pokedex-react
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

Other scripts:

```bash
npm run build              # production build
npm run preview            # preview the production build locally
npm run lint                # run ESLint
npm run test                 # run unit tests
npm run test:coverage        # run unit tests with coverage report
```

## Project structure

```
src/
  api/pokeapi.js             # PokeAPI fetch layer (index, per-Pokemon detail, per-type members, species, evolution chain)
  components/
    TopBar.jsx               # sticky header — logo, search bar (home only), nav
    SearchBar.jsx            # debounced search input
    TypeFilter.jsx           # multi-select type filter chips
    Pagination.jsx           # numbered pagination + jump-to-page input
    PokemonList.jsx          # renders the grid of cards (or skeletons for pending ones)
    PokemonCard.jsx          # single card — favorite toggle, cry player
    PokemonImage.jsx         # <img> with a pokeball-icon fallback for missing/broken artwork
    PokemonPicker.jsx        # searchable Pokemon combobox, used on the Compare page
    LoadingSpinner.jsx       # bouncing pokeball loading indicator
    SkeletonCard.jsx         # loading placeholder card
    BattleArena.jsx          # the battle simulator UI (stage, HP bars, chat log, damage-formula popover)
    TypeIcon.jsx             # inline SVG + react-icons icons (type icons, star, play, pokeball, etc.)
  pages/
    PokemonGridPage.jsx      # home — grid, filter, search, pagination
    PokemonDetailPage.jsx    # single Pokemon detail view
    ComparePage.jsx          # head-to-head stat comparison + battle simulator
    FavoritesPage.jsx        # favorited Pokemon, same card grid as home
    NotFoundPage.jsx         # catch-all 404
  store/
    usePokemonStore.js       # Pokemon index + on-demand detail/type caches (Zustand)
    useFavoriteStore.js      # favorites, persisted to localStorage (Zustand)
    useCryPlayerStore.js     # tracks which cry is currently playing (Zustand)
  utils/
    battleSimulator.js       # turn-based battle resolution logic
    evolution.js             # flattens PokeAPI's evolution-chain tree (handles branches)
    pokedexFacts.js          # catch-difficulty buckets, size-comparison labels
    sound.js                 # synthesized sound effects (Web Audio API)
    text.js                  # small string helpers
  constants/
    typeChart.js             # type-effectiveness matrix, used by the battle simulator
    typeColors.js            # color/icon mapping for Pokemon types
    statLabels.js            # display labels for base stats
  hooks/useDebounce.jsx       # debounced value hook, used for search
  App.jsx                    # routing, top-level index load, scroll-reset on navigation
  App.css                    # component styling
  index.css                  # design tokens (colors, base layout, light/dark)
docs/
  POKEAPI-STARTER-KIT.md     # PokeAPI quick reference used while building this
```

## Notes

- **Lazy-loaded dataset**: only a lightweight index (id, name, artwork URL — derived from id, no extra fetch) loads up front. Full detail is fetched on demand and cached in `usePokemonStore`, deduped against in-flight requests, so revisiting a Pokemon never re-fetches it.
- `search`, `type`, `page`, and the Compare page's two picks are all derived directly from `useSearchParams()` — no separate `useState` duplicating them, so the URL is the single source of truth and every view is shareable/bookmarkable.
- No backend — favorites persist to `localStorage` via Zustand's `persist` middleware.
- The battle simulator isn't a faithful recreation of the games (no movesets/PP/status effects) — damage is `(Attack ÷ Defense) × Type Effectiveness × Luck`, with a small critical-hit chance layered on top, tuned to be fun to watch rather than competitively accurate.

## Credits

Pokemon data, sprites, and cries via [PokeAPI](https://pokeapi.co/).
