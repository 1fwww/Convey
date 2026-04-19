import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// ── Highlight plugin ──
// Decoupled from selection. Call editor.highlightRange(from, to) to show,
// editor.clearHighlight() to hide. Clicking inside the editor auto-clears.
const highlightKey = new PluginKey('highlight')

function createHighlightPlugin() {
  return new Plugin({
    key: highlightKey,
    state: {
      init() { return { from: 0, to: 0 } },
      apply(tr, prev) {
        const meta = tr.getMeta(highlightKey)
        if (meta) return meta
        // If doc changed, try to map positions
        if (tr.docChanged && prev.from !== prev.to) {
          return {
            from: tr.mapping.map(prev.from),
            to: tr.mapping.map(prev.to),
          }
        }
        return prev
      },
    },
    props: {
      decorations(state) {
        const { from, to } = highlightKey.getState(state)
        if (from === to) return DecorationSet.empty
        try {
          return DecorationSet.create(state.doc, [
            Decoration.inline(from, to, { class: 'editor-highlight' }),
          ])
        } catch {
          return DecorationSet.empty
        }
      },
      handleClick(view) {
        // Clear highlight on any click inside editor
        const state = highlightKey.getState(view.state)
        if (state && state.from !== state.to) {
          view.dispatch(view.state.tr.setMeta(highlightKey, { from: 0, to: 0 }))
        }
        return false
      },
    },
  })
}

export function Editor({ onReady, onEditorInstance, onFocus }) {
  const hasInitialized = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Paste your text or start typing...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'paper-editor',
        role: 'textbox',
        'aria-label': 'Your message',
        'aria-multiline': 'true',
      },
    },
    onFocus: () => {
      if (onFocus) onFocus()
    },
  })

  // Register highlight plugin and attach helper methods
  useEffect(() => {
    if (!editor) return

    // Add the plugin to the editor
    const { state } = editor.view
    const plugins = [...state.plugins, createHighlightPlugin()]
    editor.view.updateState(state.reconfigure({ plugins }))

    // Attach convenience methods
    editor.highlightRange = (from, to) => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { from, to })
      )
    }
    editor.clearHighlight = () => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { from: 0, to: 0 })
      )
    }
  }, [editor])

  useEffect(() => {
    if (editor) {
      onEditorInstance(editor)
    }
  }, [editor, onEditorInstance])

  useEffect(() => {
    if (!editor) return
    const handlePaste = () => {
      setTimeout(() => {
        if (!hasInitialized.current && editor.getText().trim().length > 0) {
          hasInitialized.current = true
          onReady(editor)
        }
      }, 100)
    }
    editor.on('paste', handlePaste)
    return () => editor.off('paste', handlePaste)
  }, [editor, onReady])

  useEffect(() => {
    if (!editor) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') === '1') {
      editor.commands.setContent(
        'I just knew from Katie that we should no longer have social icons in email footer. And this is what it should be (see screenshot). Sharing in case you also didn\'t know.'
      )
      setTimeout(() => {
        hasInitialized.current = true
        onReady(editor)
      }, 200)
    }
  }, [editor, onReady])

  return <EditorContent editor={editor} />
}
