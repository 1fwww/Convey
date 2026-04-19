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
  const [isFullSelect, setIsFullSelect] = useState(false) // Cmd+A — activated state but "Refine all" text
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Track position
  useEffect(() => {
    if (!editor) return

    const getTextBottom = () => {
      const scrollEl = editor.view.dom.closest('.paper-scroll')
      const scrollRect = scrollEl ? scrollEl.getBoundingClientRect() : editor.view.dom.getBoundingClientRect()
      const scrollTop = scrollEl ? scrollEl.scrollTop : 0

      // Walk doc to find last position with actual text
      let lastTextPos = 1
      editor.state.doc.descendants((node, pos) => {
        if (node.isText && node.text.trim()) {
          lastTextPos = pos + node.nodeSize
        }
      })
      try {
        const coords = editor.view.coordsAtPos(lastTextPos)
        return coords.bottom - scrollRect.top + scrollTop
      } catch {
        return editor.view.dom.offsetHeight
      }
    }

    let resetTimer = null

    const updatePosition = () => {
      const { from, to } = editor.state.selection
      const scrollParent = editor.view.dom.closest('.paper-scroll')

      const docSize = editor.state.doc.content.size
      const isAllSelected = from <= 1 && to >= docSize - 1

      if (to - from > 0) {
        // Cancel any pending reset — new selection takes priority
        clearTimeout(resetTimer)

        if (isAllSelected) {
          setAnchorPos({ top: getTextBottom() })
          setHasSelection(true)
          setIsFullSelect(true)
          setSelectionRange({ from, to })
        } else {
          const scrollEl = scrollParent || editor.view.dom
          const scrollRect = scrollEl.getBoundingClientRect()
          const scrollTop = scrollParent ? scrollParent.scrollTop : 0

          // Use native selection bounding rect — single rect, always reliable
          const nativeSel = window.getSelection()
          let bottom
          if (nativeSel?.rangeCount > 0) {
            const rect = nativeSel.getRangeAt(0).getBoundingClientRect()
            bottom = rect.bottom
          } else {
            bottom = editor.view.coordsAtPos(to).bottom
          }

          setAnchorPos({ top: bottom - scrollRect.top + scrollTop })
          setHasSelection(true)
          setIsFullSelect(false)
          setSelectionRange({ from, to })
        }
      } else {
        // Reset state immediately but delay position change
        if (hasSelection) {
          setValue('')
          setSelectionRange(null)
          setIsFullSelect(false)
        }
        setHasSelection(false)
        setExpanded(false)

        // Delay moving anchor to text bottom — avoids jump when quickly re-selecting
        clearTimeout(resetTimer)
        resetTimer = setTimeout(() => {
          setAnchorPos({ top: getTextBottom() })
        }, 150)
      }
    }

    const handleUpdate = () => {
      clearTimeout(resetTimer)
      setAnchorPos({ top: getTextBottom() })
    }

    editor.on('selectionUpdate', updatePosition)
    editor.on('update', handleUpdate)
    setTimeout(updatePosition, 100)

    return () => {
      clearTimeout(resetTimer)
      editor.off('selectionUpdate', updatePosition)
      editor.off('update', handleUpdate)
    }
  }, [editor, hasSelection])

  // Click outside to collapse
  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpanded(false)
        // Clear decoration on collapse
        if (editor?.clearHighlight) {
          editor.clearHighlight()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expanded, editor, hasSelection])

  const handleIconClick = useCallback(() => {
    if (editor?.highlightRange) {
      // Read selection directly from editor state at click time
      const { from, to } = editor.state.selection
      if (to - from > 0) {
        // Convert native selection to decoration BEFORE input steals focus
        editor.highlightRange(from, to)
      } else {
        // Refine all: highlight all text
        const docSize = editor.state.doc.content.size
        editor.highlightRange(1, docSize)
      }
    }
    setExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [editor])

  const handleSubmit = useCallback((instruction) => {
    // Clear highlight on submit
    if (editor?.clearHighlight) {
      editor.clearHighlight()
    }

    if (hasSelection && !isFullSelect && selectionRange && editor) {
      const selectedText = editor.state.doc.textBetween(selectionRange.from, selectionRange.to)
      onRefineSelection(selectedText, instruction || null)
    } else {
      onRefineAll(instruction || null)
    }
    setExpanded(false)
    setValue('')
    setSelectionRange(null)
    setIsFullSelect(false)
  }, [editor, hasSelection, isFullSelect, selectionRange, onRefineAll, onRefineSelection])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(value.trim() || null)
    }
    if (e.key === 'Escape') {
      setExpanded(false)
      // Clear decoration on escape
      if (editor?.clearHighlight) {
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
      onClick={(e) => e.stopPropagation()}
    >
      {!expanded && (
        <button
          className="refine-anchor-icon"
          onClick={handleIconClick}
          disabled={isLoading}
          aria-label={hasSelection && !isFullSelect ? 'Refine selection' : 'Refine all'}
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
            ✦ {hasSelection && !isFullSelect ? 'Refine selection' : 'Refine all'}
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
