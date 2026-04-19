export function InsightPanel({ result, isLoading, streamPhase, isEditing }) {
  if (isLoading) {
    return (
      <div className="insight-panel">
        <div className="insight-loading-anim">
          <div className="loading-quill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </div>
          <span className="loading-label">
            {streamPhase === 'streaming' ? 'Reading...' : 'Thinking...'}
          </span>
        </div>
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

  // When user is editing the AI suggestion, hide explanations to avoid distraction
  if (isEditing) {
    return (
      <div className="insight-panel">
        <div className="insight-empty">
          Editing...
        </div>
      </div>
    )
  }

  const { affirm, changes } = result
  const totalChanges = changes?.length || 0

  const keyInsight = changes?.find(c => c.category === 'grammar')
    || changes?.find(c => c.category === 'naturalness')
    || changes?.[0]

  return (
    <div className="insight-panel">
      {affirm && (
        <div className="affirm">{affirm}</div>
      )}

      {totalChanges > 0 && (
        <div className="insight-summary">
          <span className="insight-summary-count">{totalChanges} change{totalChanges > 1 ? 's' : ''}</span>
          <span className="insight-summary-hint">Hover highlighted words to see why</span>
        </div>
      )}

      {keyInsight && (
        <div className="key-insight">
          <div className="key-insight-label">Key takeaway</div>
          <div className="key-insight-body">
            <span className={`card-tag tag-${keyInsight.category}`}>
              {keyInsight.category}
            </span>
            <div className="key-insight-change">
              <span className="key-insight-original">{keyInsight.original}</span>
              <span className="key-insight-arrow">&rarr;</span>
              <span className="key-insight-revised">{keyInsight.revised}</span>
            </div>
            <div className="key-insight-explanation">{keyInsight.explanation}</div>
          </div>
        </div>
      )}
    </div>
  )
}
