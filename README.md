# Pokedex React

A Pokedex web app built with React + Vite, using live data from [PokeAPI](https://pokeapi.co/). Built as a practice/portfolio project while learning React fundamentals — components, hooks, custom hooks, derived state, client-side routing, and URL-synced state.

**Live demo:** [pokedex-react-adkasy.vercel.app](https://pokedex-react-adkasy.vercel.app/)

<!--
Screenshots — drop PNGs in docs/screenshots/ and uncomment:

## Screenshots

| Grid | Detail | Mobile |
| --- | --- | --- |
| ![Grid view](docs/screenshots/grid.png) | ![Detail view](docs/screenshots/detail.png) | ![Mobile view](docs/screenshots/mobile.png) |
-->

## Features

- **Pokemon grid** — first 200 Pokemon (Gen 1 + part of Gen 2), fetched once on load
- **Search** — debounced, client-side filtering by name
- **Filter by type** — multi-select type chips (Fire + Water shows either, not both required)
- **Pagination** — numbered page buttons (with `…` for gaps on large ranges), not just Prev/Next
- **URL-synced state** — search, type filter, and page all live in the URL query string (`?search=char&type=fire&page=2`), so refreshing or sharing a link preserves the exact view
- **Detail page** — stats, height/weight, abilities, artwork for a single Pokemon
- **Favorites** — toggle from any card, persisted in `localStorage`, with their own `/favorites` page
- **Pokemon cries** — play a Pokemon's actual cry sound from its card (only one plays at a time app-wide)
- **Loading skeleton** — placeholder cards (shaped like the real card) while the initial fetch is in flight
- **404 page** — any unknown route falls back to a proper not-found page instead of a blank screen
- **Responsive layout** — grid, search bar, and detail page down to mobile widths
- **Light/dark mode** — follows the OS theme automatically

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) — client-side routing + `useSearchParams` for URL-synced state
- [Zustand](https://zustand.docs.pmnd.rs/) — favorites store (persisted) and cry-player store
- Plain CSS (custom properties for theming, incl. light/dark mode, CSS container queries)
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
  api/pokeapi.js           # PokeAPI fetch layer
  components/
    TopBar.jsx             # sticky header — logo, search bar, favorites link
    SearchBar.jsx          # debounced search input
    TypeFilter.jsx         # multi-select type filter chips
    Pagination.jsx         # numbered pagination
    PokemonList.jsx        # renders the grid of cards
    PokemonCard.jsx        # single card — favorite toggle, cry player
    SkeletonCard.jsx       # loading placeholder card
    TypeIcon.jsx           # inline SVG icons (type icons, star, play, etc.)
  pages/
    PokemonGridPage.jsx    # home — grid, filter, pagination
    PokemonDetailPage.jsx  # single Pokemon detail view
    FavoritesPage.jsx      # favorited Pokemon, same card grid as home
    NotFoundPage.jsx       # catch-all 404
  store/
    useFavoriteStore.js    # favorites, persisted to localStorage (Zustand)
    useCryPlayerStore.js   # tracks which cry is currently playing (Zustand)
  hooks/
    useDebounce.jsx        # debounced value hook, used for search
  utils/sound.js           # synthesized "pop" sound on favorite (Web Audio API)
  constants/typeColors.js  # color/icon mapping for Pokemon types
  App.jsx                  # routing, top-level fetch, loading/error states
  App.css                  # component styling
  index.css                # design tokens (colors, base layout, light/dark)
docs/
  POKEAPI-STARTER-KIT.md   # PokeAPI quick reference used while building this
```

## Notes

- The first 200 Pokemon are fetched once on load via `Promise.all` — no infinite scroll or "load more", everything after that is client-side filtering/pagination over that one dataset.
- `search`, `type`, and `page` are derived directly from `useSearchParams()` — there's no separate `useState` duplicating them, so the URL is the single source of truth.
- No backend — favorites persist to `localStorage` via Zustand's `persist` middleware.

## Credits

Pokemon data, sprites, and cries via [PokeAPI](https://pokeapi.co/).
