import { useState, useEffect, useRef } from 'react'

export function FloatingRefine({ editor, onSubmit }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [value, setValue] = useState('')
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection
      if (to - from > 0) {
        const coords = editor.view.coordsAtPos(from)
        const coordsEnd = editor.view.coordsAtPos(to)
        const editorRect = editor.view.dom.getBoundingClientRect()
        const topAbove = coords.top - editorRect.top - 36

        // Clamp: don't let the button overflow the paper edges
        const scrollParent = editor.view.dom.closest('.paper-scroll')
        const scrollRect = scrollParent ? scrollParent.getBoundingClientRect() : editorRect
        const maxLeft = scrollRect.width - 120 // leave room for button width
        const rawLeft = coords.left - editorRect.left

        if (topAbove < 4) {
          setPosition({
            top: coordsEnd.bottom - editorRect.top + 4,
            left: Math.max(4, Math.min(rawLeft, maxLeft)),
          })
        } else {
          setPosition({
            top: topAbove,
            left: Math.max(4, Math.min(rawLeft, maxLeft)),
          })
        }
        setShow(true)
      } else {
        setShow(false)
        setShowInput(false)
        setValue('')
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => editor.off('selectionUpdate', handleSelectionUpdate)
  }, [editor])

  if (!show) return null

  const submitRefine = (instruction) => {
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    onSubmit(selectedText, instruction || null)
    setShow(false)
    setShowInput(false)
    setValue('')
  }

  const handleRefineClick = () => {
    // Direct click = zoom in immediately with no instruction
    submitRefine(null)
  }

  const handleInstructClick = (e) => {
    e.stopPropagation()
    setShowInput(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitRefine(value.trim() || null)
    }
    if (e.key === 'Escape') {
      setShowInput(false)
      setValue('')
      editor.commands.focus()
    }
  }

  return (
    <div
      className="floating-refine"
      style={{ top: position.top, left: position.left, position: 'absolute' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {showInput ? (
        <input
          ref={inputRef}
          className="floating-refine-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Instruction (Enter = auto refine)"
        />
      ) : (
        <div className="floating-refine-group">
          <button
            className="floating-refine-btn"
            onClick={handleRefineClick}
            aria-label="Refine selection"
          >
            ✦ Refine
          </button>
          <button
            className="floating-refine-btn-secondary"
            onClick={handleInstructClick}
            aria-label="Refine with instruction"
            title="Add instruction"
          >
            ...
          </button>
        </div>
      )}
    </div>
  )
}
