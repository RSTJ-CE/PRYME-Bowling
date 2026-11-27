import { useEffect, useState } from 'react'
import {
  ACTIONS,
  CATEGORIES,
  CONSEQUENCES,
  FINALE,
  LANE_ACTIONS,
  LANE_PERSON,
  PEOPLE,
} from './cards.js'

const COOLDOWN = 10 // seconds before "Next card" unlocks
const CARDS_PER_GAME = 5
const LANE_CARDS = [2, 4] // these cards are for the whole lane
// Person picks that mention strikes or spares are kept off the first card
// (matched by wording, so it still works if you edit the list in cards.js).
const notOnFirstCard = (personIndex) => /strike|spare/i.test(PEOPLE[personIndex])

function shuffle(n, avoidFirst) {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  if (avoidFirst !== undefined && arr[0] === avoidFirst && n > 1) {
    ;[arr[0], arr[1]] = [arr[1], arr[0]]
  }
  return arr
}

// In-memory deck: no repeats until every item has been drawn, then reshuffles.
function createDeck(n) {
  let order = shuffle(n)
  let pos = 0
  let last
  return {
    draw(accept) {
      let reshuffled = false
      if (pos >= order.length) {
        order = shuffle(n, last)
        pos = 0
        reshuffled = true
      }
      if (accept) {
        // Bring the next acceptable item forward (reshuffle if none are left).
        let j = order.findIndex((v, i) => i >= pos && accept(v))
        if (j === -1) {
          order = shuffle(n, last)
          pos = 0
          reshuffled = true
          j = order.findIndex(accept)
        }
        ;[order[pos], order[j]] = [order[j], order[pos]]
      }
      last = order[pos++]
      return { index: last, reshuffled, position: pos }
    },
  }
}

export default function App() {
  // Decks live in memory only. A page refresh starts fresh decks.
  const [decks] = useState(() => ({
    actions: createDeck(ACTIONS.length),
    people: createDeck(PEOPLE.length),
    consequences: createDeck(CONSEQUENCES.length),
    lane: createDeck(LANE_ACTIONS.length),
  }))

  const [card, setCard] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [seen, setSeen] = useState(0) // card number within the current game (1-5)
  const [reshuffled, setReshuffled] = useState(false)

  // Cooldown starts the moment a card is uncovered.
  useEffect(() => {
    if (!revealed || seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [revealed, seconds])

  const uncover = () => {
    if (revealed) return
    // After the 5th card the next one starts a new game.
    const n = seen >= CARDS_PER_GAME ? 1 : seen + 1

    if (LANE_CARDS.includes(n)) {
      const act = decks.lane.draw()
      setCard({
        category: 'lane',
        person: LANE_PERSON,
        action: LANE_ACTIONS[act.index],
        consequence: null,
      })
      setReshuffled(false)
    } else if (n === CARDS_PER_GAME) {
      // Finale: fixed card, doesn't use up a card from the decks.
      setCard({
        category: FINALE.category,
        person: FINALE.person,
        action: FINALE.text,
        consequence: null,
      })
      setReshuffled(false)
    } else {
      const act = decks.actions.draw()
      const who = decks.people.draw(n === 1 ? (i) => !notOnFirstCard(i) : undefined)
      const action = ACTIONS[act.index]
      const isBowl = action.category === 'bowl'
      const pins = 1 + Math.floor(Math.random() * 9)

      setCard({
        category: action.category,
        person: PEOPLE[who.index],
        action: action.text.replace('[n]', pins),
        consequence: isBowl ? CONSEQUENCES[decks.consequences.draw().index] : null,
      })
      setReshuffled(act.reshuffled)
    }

    setSeen(n)
    setSeconds(COOLDOWN)
    setRevealed(true)
  }

  const next = () => {
    if (!revealed || seconds > 0) return
    setRevealed(false)
    setReshuffled(false)
  }

  const cat = card ? CATEGORIES[card.category] : null
  const waiting = revealed && seconds > 0

  return (
    <main className="app">
      <header className="top">
        <span className="brand">PRYME cards</span>
        <span className="count">
          {seen === 0 ? `${CARDS_PER_GAME} cards` : `Card ${seen} of ${CARDS_PER_GAME}`}
        </span>
      </header>

      <section className="stage">
        <div className={`flipper ${revealed ? 'is-open' : ''}`} aria-live="polite">
          <div className="face cover" aria-hidden={revealed}>
            <div className="lanes" />
            <div className="cover-mark">
              <span className="pin" aria-hidden="true">🎳</span>
              <span className="cover-title">PRYME</span>
              <span className="cover-sub">cards</span>
            </div>
          </div>

          <div
            className="face front"
            style={cat ? { '--accent': cat.color } : undefined}
            aria-hidden={!revealed}
          >
            {card && (
              <>
                <div className="who">
                  <div className="label">Who goes</div>
                  <p className="who-text">{card.person}</p>
                </div>

                <div className="what">
                  <div className="tag">
                    <span aria-hidden="true">{cat.emoji}</span> {cat.label}
                  </div>
                  <p className="action">{card.action}</p>
                </div>

                {card.consequence && (
                  <div className="fail">
                    <div className="label">If you fail</div>
                    <p className="fail-text">{card.consequence}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className={`note ${reshuffled ? 'show' : ''}`}>
          All cards used. Deck reshuffled.
        </p>
      </section>

      <footer className="actions">
        {!revealed ? (
          <button className="btn primary" onClick={uncover}>
            Uncover card
          </button>
        ) : (
          <button className="btn primary" onClick={next} disabled={waiting}>
            {waiting ? `Next card (${seconds}s)` : 'Next card'}
          </button>
        )}
      </footer>
    </main>
  )
}