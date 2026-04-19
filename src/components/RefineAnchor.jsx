import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Unified refine entry point.
 * - Click to expand, click outside or Escape to collapse
 * - Selection mode: highlights selected text, persists until flow completes
 * - Refine all mode: highlights all text, clears on submit
 */
export function RefineAnchor({ editor, onRefineAll, onRefineSelection, isLoading, hidden }) {
  const [anchorPos, setAnchorPos] = useState(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState('')
  const [selectionRange, setSelectionRange] = useState(null) // { from, to } for selection mode
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Track position
  useEffect(() => {
    if (!editor) return

    const updatePosition = () => {
      const { from, to } = editor.state.selection
      const editorRect = editor.view.dom.getBoundingClientRect()
      const scrollParent = editor.view.dom.closest('.paper-scroll')

      const docSize = editor.state.doc.content.size
      const isAllSelected = from <= 1 && to >= docSize - 1

      if (to - from > 0) {
        // Highlight selected text
        if (editor.highlightRange) {
          editor.highlightRange(from, to)
        }

        if (isAllSelected) {
          // Full select (Cmd+A) — treat as "refine all", anchor at end
          const endPos = editor.state.doc.content.size
          const coords = editor.view.coordsAtPos(endPos)
          const scrollTop = scrollParent ? scrollParent.scrollTop : 0
          setAnchorPos({ top: coords.bottom - editorRect.top + scrollTop })
          setHasSelection(false)
        } else {
          // Partial select — anchor below selection
          const endCoords = editor.view.coordsAtPos(to)
          const scrollTop = scrollParent ? scrollParent.scrollTop : 0
          setAnchorPos({ top: endCoords.bottom - editorRect.top + scrollTop })
          setHasSelection(true)
          setSelectionRange({ from, to })
        }
      } else {
        const endPos = editor.state.doc.content.size
        const coords = editor.view.coordsAtPos(endPos)
        const scrollTop = scrollParent ? scrollParent.scrollTop : 0
        setAnchorPos({ top: coords.bottom - editorRect.top + scrollTop })
        if (hasSelection) {
          setValue('')
          setSelectionRange(null)
        }
        setHasSelection(false)
        setExpanded(false)
      }
    }

    editor.on('selectionUpdate', updatePosition)
    editor.on('update', updatePosition)
    setTimeout(updatePosition, 100)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('update', updatePosition)
    }
  }, [editor, hasSelection])

  // Click outside to collapse
  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpanded(false)
        // Refine all mode: clear highlight on collapse
        if (!hasSelection && editor?.clearHighlight) {
          editor.clearHighlight()
        }
        // Selection mode: keep highlight (user may still want to refine)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expanded, editor, hasSelection])

  const handleIconClick = useCallback(() => {
    setExpanded(true)
    if (!hasSelection && editor) {
      // Refine all: highlight all text
      const docSize = editor.state.doc.content.size
      if (editor.highlightRange) {
        editor.highlightRange(1, docSize)
      }
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [editor, hasSelection])

  const handleSubmit = useCallback((instruction) => {
    // Clear highlight on submit
    if (editor?.clearHighlight) {
      editor.clearHighlight()
    }

    if (hasSelection && selectionRange && editor) {
      const selectedText = editor.state.doc.textBetween(selectionRange.from, selectionRange.to)
      onRefineSelection(selectedText, instruction || null)
    } else {
      onRefineAll(instruction || null)
    }
    setExpanded(false)
    setValue('')
    setSelectionRange(null)
  }, [editor, hasSelection, selectionRange, onRefineAll, onRefineSelection])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(value.trim() || null)
    }
    if (e.key === 'Escape') {
      setExpanded(false)
      // Refine all: clear highlight
      if (!hasSelection && editor?.clearHighlight) {
        editor.clearHighlight()
      }
      editor?.commands.focus()
    }
  }, [value, handleSubmit, editor, hasSelection])

  if (!anchorPos || !editor || hidden) return null

  return (
    <div
      ref={containerRef}
      className={`refine-anchor ${expanded ? 'expanded' : ''} ${hasSelection ? 'has-selection' : ''} ${isLoading ? 'loading' : ''}`}
      style={{ top: anchorPos.top }}
      onMouseDown={(e) => {
        if (e.target !== inputRef.current) e.preventDefault()
      }}
    >
      {!expanded && (
        <button
          className="refine-anchor-icon"
          onClick={handleIconClick}
          disabled={isLoading}
          aria-label={hasSelection ? 'Refine selection' : 'Refine all'}
        >
          ✦
        </button>
      )}

      {expanded && (
        <div className="refine-anchor-row">
          <button
            className="refine-anchor-btn"
            onClick={() => handleSubmit(null)}
            disabled={isLoading}
          >
            ✦ {hasSelection ? 'Refine selection' : 'Refine all'}
          </button>
          <span className="refine-anchor-or">or</span>
          <div className="refine-anchor-input-wrap">
            <input
              ref={inputRef}
              className={`refine-anchor-input ${value ? 'has-value' : ''}`}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="instruction…"
              disabled={isLoading}
            />
            <span className="refine-anchor-enter">↵</span>
          </div>
        </div>
      )}
    </div>
  )
}
