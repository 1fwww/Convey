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
  const [streamPhase, setStreamPhase] = useState('idle') // 'idle' | 'connecting' | 'streaming'
  const [mainEditor, setMainEditor] = useState(null)
  const [activeEditor, setActiveEditor] = useState('main')

  // Zoom-in state for partial refine
  const [zoomState, setZoomState] = useState(null)
  // zoomState = { fullHTML: string, selectedText: string, from: number, to: number }

  const isZoomed = zoomState !== null

  // Paper: dynamic height, only grows within a session
  const paperRef = useRef(null)
  const paperMaxObserved = useRef(0)

  useEffect(() => {
    const el = paperRef.current
    if (!el) return
    const BREATHING_ROOM = 48 // px of extra space below content
    const observer = new ResizeObserver(() => {
      // Measure the natural content height (toolbar + scroll content)
      const scrollEl = el.querySelector('.paper-scroll')
      if (!scrollEl) return
      const contentH = scrollEl.scrollHeight + el.querySelector('.toolbar')?.offsetHeight + BREATHING_ROOM
      const clamped = Math.min(contentH, 600) // respect max-height
      if (clamped > paperMaxObserved.current) {
        paperMaxObserved.current = clamped
        el.style.minHeight = `${clamped}px`
      }
    })
    observer.observe(el)
    // Also observe the scroll area for content changes
    const scrollEl = el.querySelector('.paper-scroll')
    if (scrollEl) observer.observe(scrollEl)
    return () => observer.disconnect()
  }, [])

  const currentEditor = activeEditor === 'ai' ? null : mainEditor

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
      alert('AI analysis failed: ' + err.message)
    }
    setIsAnalyzing(false)
    setStreamPhase('idle')
  }, [])

  const handleDismissAI = useCallback(() => {
    setAiResult(null)
    setActiveEditor('main')
  }, [])

  const handleRestore = useCallback((html) => {
    if (!mainEditor) return
    const currentHTML = mainEditor.getHTML()
    setVersions(prev => [...prev, currentHTML])
    mainEditor.commands.setContent(html)
  }, [mainEditor])

  const handleReplace = useCallback((html) => {
    if (!mainEditor) return

    if (isZoomed) {
      // Replacing within a zoom — put the edited part back into the full text
      // Store the edited fragment, we'll merge on zoom-out
      setZoomState(prev => prev ? { ...prev, editedHTML: html } : null)
      setAiResult(prev => ({ ...prev, applied: true }))
      mainEditor.commands.setContent(html)
      setActiveEditor('main')
      mainEditor.commands.focus()
    } else {
      const currentHTML = mainEditor.getHTML()
      setVersions(prev => [...prev, currentHTML])
      mainEditor.commands.setContent(html)
      setAiResult(prev => ({ ...prev, applied: true }))
      setActiveEditor('main')
      mainEditor.commands.focus()
    }
  }, [mainEditor, isZoomed])

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

  // Floating refine — zoom into selected text
  const handleFloatingRefine = useCallback(async (selectedText, instruction) => {
    if (!mainEditor) return

    const { from, to } = mainEditor.state.selection
    const fullHTML = mainEditor.getHTML()

    // Save zoom state
    setZoomState({ fullHTML, selectedText, from, to })

    // Replace editor content with just the selected text
    mainEditor.commands.setContent(selectedText)

    // Trigger AI analysis on the selection
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

  // Zoom out — merge edited fragment back into full text
  const handleZoomOut = useCallback(() => {
    if (!mainEditor || !zoomState) return

    const editedFragment = mainEditor.getHTML()
    const { fullHTML, selectedText } = zoomState

    // Save full text as a version
    setVersions(prev => [...prev, fullHTML])

    // Replace the selected part in the original full text
    // Simple approach: replace first occurrence of selectedText with edited version
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = fullHTML
    const fullText = tempDiv.textContent || ''
    const editedDiv = document.createElement('div')
    editedDiv.innerHTML = editedFragment
    const editedText = editedDiv.textContent || ''

    // Reconstruct by replacing in HTML
    // Use text-level replacement for reliability
    let newFullHTML = fullHTML
    if (fullText.includes(selectedText)) {
      // Find and replace in the text content, preserving surrounding HTML
      const idx = fullText.indexOf(selectedText)
      const before = fullText.substring(0, idx)
      const after = fullText.substring(idx + selectedText.length)
      newFullHTML = `<p>${before}${editedText}${after}</p>`
    }

    mainEditor.commands.setContent(newFullHTML)
    setZoomState(null)
    setAiResult(null)

    // Restore selection on the edited region so user sees what was changed
    setTimeout(() => {
      const fullText = mainEditor.getText()
      const idx = fullText.indexOf(editedText)
      if (idx >= 0) {
        // +1 offset for ProseMirror doc node
        mainEditor.commands.setTextSelection({ from: idx + 1, to: idx + 1 + editedText.length })
      }
      mainEditor.commands.focus()
    }, 50)
  }, [mainEditor, zoomState])

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

  return (
    <div className="convey-app">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo">Convey</span>
          <span className="source-tag">Slack</span>
          {isZoomed && (
            <span className="zoom-indicator">
              Refining selection
              <button
                className="zoom-action apply"
                onClick={handleZoomOut}
                aria-label="Apply and return to full text"
                title="Apply"
              >✓</button>
              <button
                className="zoom-action cancel"
                onClick={() => {
                  mainEditor.commands.setContent(zoomState.fullHTML)
                  setZoomState(null)
                  setAiResult(null)
                }}
                aria-label="Cancel and return to full text"
                title="Cancel"
              >✕</button>
            </span>
          )}
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
              editor={currentEditor || mainEditor}
              versions={isZoomed ? [] : versions}
              onRestore={handleRestore}
            />

            <div className="paper-scroll" style={{ position: 'relative' }}>
              <Editor
                onReady={handleContentReady}
                onEditorInstance={setMainEditor}
                onFocus={() => setActiveEditor('main')}
              />

              {!isZoomed && (
                <RefineAnchor
                  editor={mainEditor}
                  onRefineAll={handleRefine}
                  onRefineSelection={handleFloatingRefine}
                  isLoading={isAnalyzing}
                />
              )}

              {isAnalyzing && (
                <div className="ai-suggestion-loading">
                  <div className="shimmer-line" style={{ width: '92%' }} />
                  <div className="shimmer-line" style={{ width: '78%' }} />
                  <div className="shimmer-line" style={{ width: '85%' }} />
                </div>
              )}

              {aiResult && !aiResult.applied && (
                <AISuggestion
                  result={aiResult}
                  onReplace={handleReplace}
                  onDismiss={handleDismissAI}
                  onFocusEditor={(which) => setActiveEditor(which)}
                />
              )}
            </div>
          </div>
        </section>

        <aside className="col-insight" aria-label="Suggestions">
          <InsightPanel
            result={aiResult}
            isLoading={isAnalyzing}
            streamPhase={streamPhase}
          />
        </aside>
      </main>
    </div>
  )
}
