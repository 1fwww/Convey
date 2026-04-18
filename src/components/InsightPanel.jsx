import { useState } from 'react'

export function InsightPanel({ result, isLoading }) {
  const [currentCard, setCurrentCard] = useState(0)

  if (isLoading) {
    return (
      <div className="insight-panel">
        <div className="insight-loading">Analyzing...</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="insight-panel">
        <div className="insight-empty">
          Paste or type a message to get suggestions
        </div>
      </div>
    )
  }

  const { affirm, changes } = result
  const card = changes?.[currentCard]
  const total = changes?.length || 0

  return (
    <div className="insight-panel">
      {affirm && (
        <div className="affirm">{affirm}</div>
      )}

      {card && (
        <>
          <div className="card-header">
            <span className="card-header-label">{currentCard + 1} / {total}</span>
          </div>
          <div className="card">
            <span className={`card-tag tag-${card.category}`}>
              {card.category}
            </span>
            <div className="card-original">&ldquo;{card.original}&rdquo;</div>
            <div className="card-suggestion">
              &ldquo;<strong>{card.revised}</strong>&rdquo;
            </div>
            <div className="card-explanation">{card.explanation}</div>

            {total > 1 && (
              <nav className="card-nav">
                <button
                  onClick={() => setCurrentCard(i => Math.max(0, i - 1))}
                  disabled={currentCard === 0}
                >
                  &larr;
                </button>
                {changes.map((_, i) => (
                  <span
                    key={i}
                    className={`pip ${i === currentCard ? 'active' : ''}`}
                    onClick={() => setCurrentCard(i)}
                  />
                ))}
                <button
                  onClick={() => setCurrentCard(i => Math.min(total - 1, i + 1))}
                  disabled={currentCard === total - 1}
                >
                  &rarr;
                </button>
              </nav>
            )}
          </div>
        </>
      )}
    </div>
  )
}
