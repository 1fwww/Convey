import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Unified refine entry point.
 * - No selection: anchors at the right side of the last line → refine all
 * - Has selection: anchors near the selection → refine selection
 * - Collapsed: ✦ icon
 * - Expanded: "✦ Refine" button + "or" + instruction input — single line, parallel options
 */
export function RefineAnchor({ editor, onRefineAll, onRefineSelection, isLoading }) {
  const [anchorPos, setAnchorPos] = useState(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  useEffect(() => {
    if (!editor) return

    const updatePosition = () => {
      const { from, to } = editor.state.selection
      const editorRect = editor.view.dom.getBoundingClientRect()
      const scrollParent = editor.view.dom.closest('.paper-scroll')

      if (to - from > 0) {
        const coords = editor.view.coordsAtPos(from)
        const scrollTop = scrollParent ? scrollParent.scrollTop : 0
        setAnchorPos({ top: coords.top - editorRect.top + scrollTop })
        setHasSelection(true)
      } else {
        const endPos = editor.state.doc.content.size
        const coords = editor.view.coordsAtPos(endPos)
        const scrollTop = scrollParent ? scrollParent.scrollTop : 0
        setAnchorPos({ top: coords.top - editorRect.top + scrollTop })
        setHasSelection(false)
        setExpanded(false)
        setValue('')
      }
    }

    editor.on('selectionUpdate', updatePosition)
    editor.on('update', updatePosition)
    setTimeout(updatePosition, 100)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('update', updatePosition)
    }
  }, [editor])

  const handleExpand = useCallback(() => {
    setExpanded(true)
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current)
    handleExpand()
  }, [handleExpand])

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (document.activeElement === inputRef.current) return
      if (value.trim()) return
      setExpanded(false)
    }, 300)
  }, [value])

  const handleSubmit = useCallback((instruction) => {
    if (hasSelection && editor) {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to)
      onRefineSelection(selectedText, instruction || null)
    } else {
      onRefineAll(instruction || null)
    }
    setExpanded(false)
    setValue('')
  }, [editor, hasSelection, onRefineAll, onRefineSelection])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(value.trim() || null)
    }
    if (e.key === 'Escape') {
      setExpanded(false)
      setValue('')
      editor?.commands.focus()
    }
  }, [value, handleSubmit, editor])

  if (!anchorPos || !editor) return null

  return (
    <div
      className={`refine-anchor ${expanded ? 'expanded' : ''} ${hasSelection ? 'has-selection' : ''} ${isLoading ? 'loading' : ''}`}
      style={{ top: anchorPos.top }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e) => {
        if (e.target !== inputRef.current) e.preventDefault()
      }}
    >
      {!expanded && (
        <button
          className="refine-anchor-icon"
          onClick={handleExpand}
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
            ✦ {hasSelection ? 'Refine selection' : 'Refine'}
          </button>
          <span className="refine-anchor-or">or</span>
          <input
            ref={inputRef}
            className="refine-anchor-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => clearTimeout(hoverTimeoutRef.current)}
            placeholder="instruction… ↵"
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  )
}
