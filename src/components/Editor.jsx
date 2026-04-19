import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// Plugin that shows a highlight decoration when the editor is blurred but has a selection
const selectionPersistKey = new PluginKey('selectionPersist')

const SelectionPersist = Extension.create({
  name: 'selectionPersist',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: selectionPersistKey,
        state: {
          init() { return { hasFocus: true, from: 0, to: 0 } },
          apply(tr, prev) {
            const meta = tr.getMeta(selectionPersistKey)
            if (meta) return meta
            // Update selection range when it changes
            if (tr.selectionSet || tr.docChanged) {
              return { ...prev, from: tr.selection.from, to: tr.selection.to }
            }
            return prev
          },
        },
        props: {
          decorations(state) {
            const pluginState = selectionPersistKey.getState(state)
            if (!pluginState) return DecorationSet.empty
            const { hasFocus, from, to } = pluginState
            if (hasFocus || from === to) return DecorationSet.empty
            return DecorationSet.create(state.doc, [
              Decoration.inline(from, to, { class: 'selection-persist' }),
            ])
          },
        },
      }),
    ]
  },

  onFocus({ event }) {
    const { from, to } = this.editor.state.selection
    // Remove the persist decoration
    const tr = this.editor.view.state.tr.setMeta(selectionPersistKey, {
      hasFocus: true,
      from,
      to,
    })
    this.editor.view.dispatch(tr)

    // If there was a persisted selection and user clicked back in,
    // collapse to click position so they don't have to click twice
    if (from !== to && event?.type === 'focus') {
      // Let the click resolve its position first, then check
      setTimeout(() => {
        const newSel = this.editor.state.selection
        // If selection is still the old range (not changed by click), collapse it
        if (newSel.from === from && newSel.to === to) {
          this.editor.commands.setTextSelection(to)
        }
      }, 0)
    }
  },

  onBlur() {
    const { from, to } = this.editor.state.selection
    this.editor.view.dispatch(
      this.editor.view.state.tr.setMeta(selectionPersistKey, {
        hasFocus: false,
        from,
        to,
      })
    )
    // Clear native browser selection so only the decoration shows
    window.getSelection()?.removeAllRanges()
  },
})

export function Editor({ onReady, onEditorInstance, onFocus }) {
  const hasInitialized = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Paste your text or start typing...',
      }),
      SelectionPersist,
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
    if (editor) {
      onEditorInstance(editor)
    }
  }, [editor, onEditorInstance])

  // Handle initial paste
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

  // Demo mode
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
