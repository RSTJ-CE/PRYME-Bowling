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

## Game structure
A game is 5 cards:
- Cards 1 and 3: random card (get to know you, team interaction or bowling challenge) for a random person.
- Cards 2 and 4: a whole-lane card ("Everyone in your lane"). Prompts are in `LANE_ACTIONS` in `src/cards.js`.
- Card 5: the finale ("Give a short victory speech."), always for the person with the highest total score.
After card 5, the next card starts a new game. Change `CARDS_PER_GAME` and `LANE_CARDS` at the top of `src/App.jsx`.

## Cooldown
After a card is uncovered, "Next card" stays locked for 10 seconds. Change `COOLDOWN` (seconds)
at the top of `src/App.jsx`.
