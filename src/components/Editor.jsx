import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// ── Highlight + Dim plugin ──
// highlight: green inline decoration for a specific range
// dim: fades everything OUTSIDE a range (spotlight effect)
const highlightKey = new PluginKey('highlight')

const HighlightExtension = Extension.create({
  name: 'highlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: highlightKey,
        state: {
          init() { return { highlight: null, dim: null } },
          // highlight: { from, to } or null
          // dim: { from, to } or null — the range to KEEP visible; everything else is dimmed
          apply(tr, prev) {
            const meta = tr.getMeta(highlightKey)
            if (meta) return { ...prev, ...meta }
            if (tr.docChanged) {
              const mapped = { ...prev }
              if (prev.highlight) {
                mapped.highlight = {
                  from: tr.mapping.map(prev.highlight.from),
                  to: tr.mapping.map(prev.highlight.to),
                }
              }
              if (prev.dim) {
                mapped.dim = {
                  from: tr.mapping.map(prev.dim.from),
                  to: tr.mapping.map(prev.dim.to),
                }
              }
              return mapped
            }
            return prev
          },
        },
        props: {
          decorations(state) {
            const { highlight, dim } = highlightKey.getState(state)
            const decorations = []

            // Highlight decoration
            if (highlight && highlight.from !== highlight.to) {
              try {
                decorations.push(
                  Decoration.inline(highlight.from, highlight.to, { class: 'editor-highlight' })
                )
              } catch { /* out of bounds */ }
            }

            // Dim decorations — everything outside the "spotlight" range
            if (dim && dim.from !== dim.to) {
              const docSize = state.doc.content.size
              try {
                if (dim.from > 1) {
                  decorations.push(
                    Decoration.inline(1, dim.from, { class: 'editor-dimmed' })
                  )
                }
                if (dim.to < docSize) {
                  decorations.push(
                    Decoration.inline(dim.to, docSize, { class: 'editor-dimmed' })
                  )
                }
              } catch { /* out of bounds */ }
            }

            return decorations.length > 0
              ? DecorationSet.create(state.doc, decorations)
              : DecorationSet.empty
          },
        },
      }),
    ]
  },
})

export function Editor({ onReady, onEditorInstance, onFocus }) {
  const hasInitialized = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Paste your text or start typing...',
      }),
      HighlightExtension,
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

  useEffect(() => {
    if (!editor) return

    editor.highlightRange = (from, to) => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { highlight: { from, to } })
      )
    }
    editor.clearHighlight = () => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { highlight: null })
      )
    }
    editor.dimExcept = (from, to) => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { dim: { from, to } })
      )
    }
    editor.clearDim = () => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { dim: null })
      )
    }
    editor.clearAll = () => {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(highlightKey, { highlight: null, dim: null })
      )
    }

    onEditorInstance(editor)
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
