# PRYME cards

Single-page bowling interaction cards app (Vite + React). No backend, no storage.
Each phone runs its own deck in memory; refreshing starts a fresh deck.

## Run locally
    npm install
    npm run dev

## Deploy to Netlify
- Drag-and-drop: run `npm run build`, then drop the `dist/` folder onto Netlify, or
- Connect the repo. `netlify.toml` already sets build command `npm run build` and publish dir `dist`.

## Edit cards
All cards are in `src/cards.js`.
