import { useEffect, useState } from 'react'
import { ACTIONS, CATEGORIES, CONSEQUENCES, PEOPLE } from './cards.js'

const COOLDOWN = 5

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
    draw() {
      let reshuffled = false
      if (pos >= order.length) {
        order = shuffle(n, last)
        pos = 0
        reshuffled = true
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
  }))

  const [card, setCard] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [seen, setSeen] = useState(0)
  const [reshuffled, setReshuffled] = useState(false)

  // Cooldown starts the moment a card is uncovered.
  useEffect(() => {
    if (!revealed || seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [revealed, seconds])

  const uncover = () => {
    if (revealed) return
    const act = decks.actions.draw()
    const who = decks.people.draw()
    const action = ACTIONS[act.index]
    const isBowl = action.category === 'bowl'
    const pins = 1 + Math.floor(Math.random() * 9)

    setCard({
      category: action.category,
      person: PEOPLE[who.index],
      action: action.text.replace('[n]', pins),
      consequence: isBowl ? CONSEQUENCES[decks.consequences.draw().index] : null,
    })
    setSeen(act.position)
    setReshuffled(act.reshuffled)
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
          {seen === 0 ? `${ACTIONS.length} cards` : `Card ${seen} of ${ACTIONS.length}`}
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
