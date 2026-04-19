import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

// Enrich diff HTML with tooltip data from changes array
function enrichDiffHTML(html, changes) {
  if (!html || !changes?.length) return html

  const div = document.createElement('div')
  div.innerHTML = html

  const addSpans = div.querySelectorAll('.diff-add')
  const removeSpans = div.querySelectorAll('.diff-remove')

  // Match each change to its diff spans by text content
  for (const change of changes) {
    const revisedText = change.revised?.toLowerCase().trim()
    const originalText = change.original?.toLowerCase().trim()
    const tooltip = change.explanation || ''
    const category = change.category || ''

    // Match added spans
    for (const span of addSpans) {
      if (span.dataset.matched) continue
      const spanText = span.textContent.toLowerCase().trim()
      if (revisedText && (spanText === revisedText || revisedText.includes(spanText) || spanText.includes(revisedText))) {
        span.dataset.tooltip = tooltip
        span.dataset.category = category
        span.dataset.matched = '1'
        break
      }
    }

    // Match removed spans
    for (const span of removeSpans) {
      if (span.dataset.matched) continue
      const spanText = span.textContent.toLowerCase().trim()
      if (originalText && (spanText === originalText || originalText.includes(spanText) || spanText.includes(originalText))) {
        span.dataset.tooltip = tooltip
        span.dataset.category = category
        span.dataset.matched = '1'
        break
      }
    }
  }

  return div.innerHTML
}

export function AISuggestion({ result, onReplace, onDismiss, onFocusEditor }) {
  const [isEdited, setIsEdited] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [tooltip, setTooltip] = useState(null) // { text, x, y }
  const diffRef = useRef(null)

  // Handle hover on diff spans
  const handleDiffMouseOver = useCallback((e) => {
    const span = e.target.closest('[data-tooltip]')
    if (!span) { setTooltip(null); return }
    const rect = span.getBoundingClientRect()
    setTooltip({
      text: span.dataset.tooltip,
      category: span.dataset.category,
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
  }, [])

  const handleDiffMouseOut = useCallback((e) => {
    const related = e.relatedTarget
    if (related && related.closest?.('[data-tooltip]')) return
    setTooltip(null)
  }, [])

  const enrichedHTML = useMemo(
    () => enrichDiffHTML(result?.revisedHTML, result?.changes),
    [result?.revisedHTML, result?.changes]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: result?.revised || '',
    editorProps: {
      attributes: {
        class: 'ai-editor',
        role: 'textbox',
        'aria-label': 'AI suggestion — click to edit',
        'aria-multiline': 'true',
      },
    },
    onFocus: () => {
      setIsFocused(true)
      // Tell parent to bind toolbar to this editor
      if (onFocusEditor) onFocusEditor('ai')
    },
    onBlur: () => {
      // Delay so button clicks inside the suggestion can fire before state changes
      setTimeout(() => {
        setIsFocused(false)
        if (onFocusEditor) onFocusEditor('main')
        if (editor) {
          const currentText = editor.getText().trim()
          const originalText = (result?.revised || '').trim()
          setIsEdited(currentText !== originalText)
        }
      }, 150)
    },
    onUpdate: () => {
      // Mark as edited on any change
      if (editor) {
        const currentText = editor.getText().trim()
        const originalText = (result?.revised || '').trim()
        setIsEdited(currentText !== originalText)
      }
    },
  })

  // Update editor content when result changes
  useEffect(() => {
    if (editor && result?.revised) {
      editor.commands.setContent(result.revised)
      setIsEdited(false)
      setIsFocused(false)
    }
  }, [result?.revised, editor])

  if (!result?.revisedHTML) return null

  const showDiff = !isFocused && !isEdited

  const handleClickDiff = () => {
    setIsFocused(true)
    setTooltip(null) // Clear any visible tooltip
    setTimeout(() => {
      if (editor) editor.commands.focus()
    }, 0)
  }

  const handleReplace = () => {
    if (editor) {
      onReplace(editor.getHTML())
    }
  }

  const handleRevert = () => {
    if (editor && result?.revised) {
      editor.commands.setContent(result.revised)
      setIsEdited(false)
    }
  }

  // Expose this editor instance for toolbar binding
  if (editor) {
    editor._isAISuggestion = true
  }

  return (
    <div
      className={`ai-suggestion ${showDiff ? 'learning' : 'editing'}`}
      role="region"
      aria-label="AI suggestion"
    >
      <div
        className="ai-suggestion-actions"
        role="group"
        aria-label="AI suggestion actions"
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          className="ai-action-btn apply"
          onClick={handleReplace}
          aria-label={isEdited ? "Replace with your edit" : "Use AI version"}
        >
          ↑
        </button>
        <button
          className="ai-action-btn revert"
          onClick={handleRevert}
          aria-label="Revert to AI version"
          style={{ display: isEdited ? 'flex' : 'none' }}
        >
          ↺
        </button>
        <button
          className="ai-action-btn dismiss"
          onClick={onDismiss}
          aria-label="Dismiss AI suggestion"
        >
          ✕
        </button>
      </div>

      {/* Diff overlay — shown when not focused and not edited */}
      {showDiff && (
        <div
          ref={diffRef}
          className="ai-suggestion-diff"
          dangerouslySetInnerHTML={{ __html: enrichedHTML }}
          onClick={handleClickDiff}
          onMouseOver={handleDiffMouseOver}
          onMouseOut={handleDiffMouseOut}
          role="button"
          tabIndex={0}
          aria-label="Click to edit AI suggestion"
          onKeyDown={(e) => { if (e.key === 'Enter') handleClickDiff() }}
        />
      )}

      {/* Tooltip portal — only in learning mode */}
      {showDiff && tooltip && createPortal(
        <div
          className="diff-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}

      {/* Tiptap editor — always mounted, hidden behind diff overlay when in learning mode */}
      <div style={{ display: showDiff ? 'none' : 'block' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// Export a way to get the AI editor instance
AISuggestion.getEditor = null
