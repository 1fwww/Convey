import { useState, useCallback, useRef, useEffect } from 'react'
import { Editor } from './components/Editor'
import { InsightPanel } from './components/InsightPanel'
import { AISuggestion } from './components/AISuggestion'
import { Toolbar } from './components/Toolbar'
import { RefineAnchor } from './components/RefineAnchor'
import { analyzeText } from './services/ai'

export default function App() {
  const [versions, setVersions] = useState([])
  const [aiResult, setAiResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [streamPhase, setStreamPhase] = useState('idle')
  const [mainEditor, setMainEditor] = useState(null)
  const [activeEditor, setActiveEditor] = useState('main')

  // Selection refine state — no zoom, just track what was selected
  const [selectionRefine, setSelectionRefine] = useState(null)
  // { selectedText, from, to, leadingSpace, trailingSpace }

  const isSelectionMode = selectionRefine !== null

  // Paper: dynamic height, only grows within a session
  const paperRef = useRef(null)
  const paperMaxObserved = useRef(0)

  useEffect(() => {
    const el = paperRef.current
    if (!el) return
    const BREATHING_ROOM = 48
    const observer = new ResizeObserver(() => {
      const scrollEl = el.querySelector('.paper-scroll')
      if (!scrollEl) return
      const contentH = scrollEl.scrollHeight + (el.querySelector('.toolbar')?.offsetHeight || 0) + BREATHING_ROOM
      const clamped = Math.min(contentH, 600)
      if (clamped > paperMaxObserved.current) {
        paperMaxObserved.current = clamped
        el.style.minHeight = `${clamped}px`
      }
    })
    observer.observe(el)
    const scrollEl = el.querySelector('.paper-scroll')
    if (scrollEl) observer.observe(scrollEl)
    return () => observer.disconnect()
  }, [])

  // ── Handlers ──

  const handleContentReady = useCallback(async (editor) => {
    const html = editor.getHTML()
    if (!html || html === '<p></p>') return

    setAiResult(null)
    setIsAnalyzing(true)
    setStreamPhase('connecting')
    try {
      const result = await analyzeText(html, null, {
        onStreamStart: () => setStreamPhase('streaming'),
      })
      setAiResult(result)
    } catch (err) {
      console.error('AI analysis failed:', err)
    }
    setIsAnalyzing(false)
    setStreamPhase('idle')
  }, [])

  const handleDismissAI = useCallback(() => {
    setAiResult(null)
    setActiveEditor('main')

    if (isSelectionMode && mainEditor) {
      // Clear dim, keep highlight + selectionRefine so anchor stays
      mainEditor.clearDim?.()
    } else {
      mainEditor?.clearAll?.()
    }
  }, [isSelectionMode, mainEditor])

  const handleRestore = useCallback((html) => {
    if (!mainEditor) return
    setVersions(prev => [...prev, mainEditor.getHTML()])
    mainEditor.commands.setContent(html)
  }, [mainEditor])

  const handleReplace = useCallback((html) => {
    if (!mainEditor) return

    if (isSelectionMode && selectionRefine) {
      const { from, to, leadingSpace, trailingSpace } = selectionRefine

      setVersions(prev => [...prev, mainEditor.getHTML()])

      // Extract plain text from AI HTML, restore whitespace
      const editedDiv = document.createElement('div')
      editedDiv.innerHTML = html
      let editedText = editedDiv.textContent || ''
      editedText = (leadingSpace || '') + editedText.trim() + (trailingSpace || '')

      // Replace the selection range in-place using ProseMirror directly
      const { state } = mainEditor.view
      const tr = state.tr.insertText(editedText, from, to)
      mainEditor.view.dispatch(tr)

      const newTo = from + editedText.length

      setSelectionRefine(null)
      setAiResult(null)
      setActiveEditor('main')

      // Clear dim, highlight the replaced region
      mainEditor.clearDim?.()
      setTimeout(() => {
        mainEditor.highlightRange?.(from, newTo)
      }, 30)
    } else {
      setVersions(prev => [...prev, mainEditor.getHTML()])
      mainEditor.commands.setContent(html)
      setAiResult(prev => ({ ...prev, applied: true }))
      setActiveEditor('main')
      mainEditor.commands.focus()
    }
  }, [mainEditor, isSelectionMode, selectionRefine])

  const handleRefine = useCallback(async (instruction) => {
    if (!mainEditor) return
    const html = mainEditor.getHTML()
    setAiResult(null)
    setIsAnalyzing(true)
    setStreamPhase('connecting')
    try {
      const result = await analyzeText(html, instruction || null, {
        onStreamStart: () => setStreamPhase('streaming'),
      })
      setAiResult(result)
    } catch (err) {
      console.error('AI refine failed:', err)
    }
    setIsAnalyzing(false)
    setStreamPhase('idle')
  }, [mainEditor])

  const handleSelectionRefine = useCallback(async (selectedText, instruction) => {
    if (!mainEditor) return

    const { from, to } = mainEditor.state.selection
    const leadingSpace = selectedText.match(/^(\s*)/)[0]
    const trailingSpace = selectedText.match(/(\s*)$/)[0]

    // Calculate selection bottom for positioning AI suggestion near it
    const scrollEl = mainEditor.view.dom.closest('.paper-scroll')
    const scrollRect = scrollEl?.getBoundingClientRect()
    const scrollTop = scrollEl?.scrollTop || 0
    let selectionBottom = null
    try {
      // Use coordsAtPos — always available, doesn't depend on native selection
      const coords = mainEditor.view.coordsAtPos(to)
      if (scrollRect) {
        selectionBottom = coords.bottom - scrollRect.top + scrollTop
      }
    } catch { /* fallback: will render in normal flow */ }

    setSelectionRefine({ selectedText, from, to, leadingSpace, trailingSpace, selectionBottom })

    // Scroll selected text to top of visible area
    if (scrollEl && scrollRect) {
      try {
        const selTopCoords = mainEditor.view.coordsAtPos(from)
        const selTop = selTopCoords.top - scrollRect.top + scrollTop
        scrollEl.scrollTo({ top: Math.max(0, selTop - 16), behavior: 'smooth' })
      } catch { /* skip scroll if coords fail */ }
    }

    // Dim everything except the selection, highlight the selection
    mainEditor.dimExcept?.(from, to)
    mainEditor.highlightRange?.(from, to)

    // Analyze just the selected text
    setAiResult(null)
    setIsAnalyzing(true)
    setStreamPhase('connecting')
    try {
      const prompt = instruction
        ? `Improve this text: "${selectedText}"\nInstruction: ${instruction}`
        : null
      const result = await analyzeText(`<p>${selectedText}</p>`, prompt, {
        onStreamStart: () => setStreamPhase('streaming'),
      })
      setAiResult(result)
    } catch (err) {
      console.error('AI refine failed:', err)
    }
    setIsAnalyzing(false)
    setStreamPhase('idle')
  }, [mainEditor])

  const handleCopy = useCallback(() => {
    if (!mainEditor) return
    const html = mainEditor.getHTML()
    const text = mainEditor.getText()
    if (navigator.clipboard) {
      const blob = new Blob([html], { type: 'text/html' })
      const textBlob = new Blob([text], { type: 'text/plain' })
      navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob })
      ])
    }
  }, [mainEditor])

  const handleEditorFocus = useCallback(() => {
    setActiveEditor('main')
  }, [])

  return (
    <div className="convey-app">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo">Convey</span>
          <span className="source-tag">Slack</span>
        </div>
        <nav className="topbar-right" aria-label="Actions">
          <button className="btn btn-ghost" onClick={handleCopy}>Copy</button>
          <button className="btn btn-primary">Send back</button>
        </nav>
      </header>

      <main className="main-layout">
        <section className="col-editor" aria-label="Editor">
          <div className="paper" ref={paperRef}>
            <Toolbar
              editor={mainEditor}
              versions={versions}
              onRestore={handleRestore}
            />

            <div
              className={`paper-scroll ${isSelectionMode ? 'selection-mode' : ''}`}
              style={{ position: 'relative' }}
              onClick={(e) => {
                // Click on empty area → focus at end
                if (e.target.classList.contains('paper-scroll') && mainEditor) {
                  mainEditor.commands.focus()
                  mainEditor.commands.setTextSelection(mainEditor.state.doc.content.size)
                }
                // Clear decorations on click — defer so ProseMirror places cursor first
                if (!isAnalyzing && mainEditor) {
                  setTimeout(() => {
                    if (isSelectionMode && !aiResult) {
                      setSelectionRefine(null)
                      mainEditor.clearAll?.()
                    } else if (!isSelectionMode) {
                      mainEditor.clearHighlight?.()
                    }
                  }, 0)
                }
              }}
            >
              <Editor
                onReady={handleContentReady}
                onEditorInstance={setMainEditor}
                onFocus={handleEditorFocus}
              />

              <RefineAnchor
                editor={mainEditor}
                onRefineAll={handleRefine}
                onRefineSelection={handleSelectionRefine}
                isLoading={isAnalyzing}
                hidden={isAnalyzing}
              />

              {isAnalyzing && (
                <div
                  className={`ai-suggestion-loading ${isSelectionMode ? 'selection-overlay' : ''}`}
                  style={selectionRefine?.selectionBottom ? {
                    top: selectionRefine.selectionBottom,
                  } : undefined}
                >
                  <div className="shimmer-line" style={{ width: '92%' }} />
                  <div className="shimmer-line" style={{ width: '78%' }} />
                  <div className="shimmer-line" style={{ width: '85%' }} />
                </div>
              )}

              {aiResult && !aiResult.applied && (
                <div
                  ref={(el) => {
                    // Auto-scroll to show AI response fully when it appears
                    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
                  }}
                  className={isSelectionMode ? 'selection-overlay' : undefined}
                  style={selectionRefine?.selectionBottom ? {
                    top: selectionRefine.selectionBottom,
                  } : undefined}
                >
                  <AISuggestion
                    result={aiResult}
                    onReplace={handleReplace}
                    onDismiss={handleDismissAI}
                    onFocusEditor={(which) => setActiveEditor(which)}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="col-insight" aria-label="Suggestions">
          <InsightPanel
            result={aiResult}
            isLoading={isAnalyzing}
            streamPhase={streamPhase}
            isEditing={activeEditor === 'ai'}
          />
        </aside>
      </main>
    </div>
  )
}
