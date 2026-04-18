import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

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
