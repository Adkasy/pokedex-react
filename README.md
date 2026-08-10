# Pokedex React

A small Pokedex web app built with React + Vite, using live data from [PokeAPI](https://pokeapi.co/). Built as a practice/portfolio project while learning React fundamentals (components, hooks, custom hooks, derived state, and local persistence).

<!-- Live demo: add the Vercel URL here after deploying -->

## Features

- **Pokemon list** — fetched live from PokeAPI, rendered as a grid
- **Loading / error / empty states** — clear feedback for every stage of a fetch, including "no results" for search
- **Search with debounce** — client-side filtering by name, debounced so it doesn't re-filter on every keystroke
- **Detail view** — click a card to see full stats (types, height, weight, artwork) for a single Pokemon
- **Favorites** — mark Pokemon as favorites, persisted in `localStorage` so they survive a page refresh
- **Responsive layout** — usable grid, search bar, and detail panel down to mobile widths

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- Plain CSS (custom properties for theming, incl. light/dark mode)
- [PokeAPI](https://pokeapi.co/) — no API key required
- No global state library — everything runs on local component state + a couple of custom hooks (`useDebounce`, `useLocalStorage`)

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
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint       # run ESLint
```

## Project structure

```
src/
  api/pokeapi.js           # PokeAPI fetch layer
  components/
    PokemonCard.jsx        # single Pokemon card
    PokemonList.jsx        # renders the grid of cards
  constants/typeColors.js  # color mapping for Pokemon type badges
  hooks/
    useDebounce.jsx        # debounced value hook, used for search
    useLocalStorage.jsx    # useState synced to localStorage, used for favorites
  App.jsx                  # app state, data flow, layout
  App.css                  # component styling
  index.css                # design tokens (colors, base layout)
docs/
  PHASE-1-ROADMAP.md       # milestone plan this project was built against
  POKEAPI-STARTER-KIT.md   # PokeAPI quick reference used while building this
```

## Notes

- Only the first 10 Pokemon are fetched (`limit=10` in `pokeapi.js`) to keep the scope small for this phase — bump the limit or add pagination to extend it.
- Favorites and search are both derived/local — no backend, no global state library. See `docs/PHASE-1-ROADMAP.md` for the reasoning behind that choice.

## Credits

Pokemon data and sprites via [PokeAPI](https://pokeapi.co/).
