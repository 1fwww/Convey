import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

export function AISuggestion({ result, onReplace, onDismiss, onFocusEditor }) {
  const [isEdited, setIsEdited] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

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
    // Set focused first so React unhides the editor, then focus on next tick
    setIsFocused(true)
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
          className="ai-suggestion-diff"
          dangerouslySetInnerHTML={{ __html: result.revisedHTML }}
          onClick={handleClickDiff}
          role="button"
          tabIndex={0}
          aria-label="Click to edit AI suggestion"
          onKeyDown={(e) => { if (e.key === 'Enter') handleClickDiff() }}
        />
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
