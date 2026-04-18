import { useState, useRef, useEffect } from 'react'

export function Toolbar({ editor, versions, onRestore }) {
  const [showHistory, setShowHistory] = useState(false)
  const historyRef = useRef(null)

  useEffect(() => {
    if (!showHistory) return
    const handleClick = (e) => {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowHistory(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [showHistory])

  if (!editor) return null

  const wordCount = editor.getText().split(/\s+/).filter(Boolean).length

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      <button
        className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
        aria-pressed={editor.isActive('bold')}
      >
        B
      </button>
      <button
        className={`toolbar-btn italic ${editor.isActive('italic') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
        aria-pressed={editor.isActive('italic')}
      >
        I
      </button>
      <button
        className={`toolbar-btn strike ${editor.isActive('strike') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
        aria-pressed={editor.isActive('strike')}
      >
        S
      </button>

      <div className="toolbar-sep" role="separator" />

      <button
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
        aria-pressed={editor.isActive('bulletList')}
      >
        &bull;
      </button>
      <button
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered list"
        aria-pressed={editor.isActive('orderedList')}
      >
        1.
      </button>
      <button
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Quote"
        aria-pressed={editor.isActive('blockquote')}
      >
        &ldquo;
      </button>
      <button
        className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code block"
        aria-pressed={editor.isActive('codeBlock')}
      >
        &lt;/&gt;
      </button>

      <div className="toolbar-right">
        {versions && versions.length > 0 && (
          <div className="history-wrapper" ref={historyRef}>
            <button
              className={`toolbar-btn-text ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
              aria-label={`${versions.length} previous versions`}
              aria-expanded={showHistory}
              aria-haspopup="true"
            >
              ↶ {versions.length}
            </button>
            {showHistory && (
              <div className="history-dropdown" role="menu">
                {versions.map((html, i) => (
                  <div
                    key={i}
                    className="history-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      onRestore(html)
                      setShowHistory(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onRestore(html)
                        setShowHistory(false)
                      }
                    }}
                  >
                    <span className="history-label">v{i + 1}</span>
                    <span className="history-preview" dangerouslySetInnerHTML={{
                      __html: html.replace(/<[^>]*>/g, '').slice(0, 60) + '...'
                    }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <span className="toolbar-meta" aria-live="polite">{wordCount} words</span>
      </div>
    </div>
  )
}
