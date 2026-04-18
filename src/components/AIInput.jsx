import { useState } from 'react'

export function AIInput({ onSubmit, isLoading, editor }) {
  const [value, setValue] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(value.trim() || null)
      setValue('')
    }
  }

  return (
    <div className="ai-input-bar">
      <button
        className="ai-input-refine-btn"
        onClick={() => { onSubmit(null); setValue('') }}
        disabled={isLoading}
        aria-label="Refine entire message"
      >
        ✦ Refine
      </button>
      <input
        className="ai-input-field"
        onFocus={() => { if (editor) editor.commands.blur() }}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? 'Analyzing...' : 'or type instruction...'}
        disabled={isLoading}
      />
    </div>
  )
}
