import { useState, useCallback } from 'react'
import { Editor } from './components/Editor'
import { InsightPanel } from './components/InsightPanel'
import { AISuggestion } from './components/AISuggestion'
import { Toolbar } from './components/Toolbar'
import { AIInput } from './components/AIInput'
import { FloatingRefine } from './components/FloatingRefine'
import { analyzeText } from './services/ai'

export default function App() {
  const [versions, setVersions] = useState([])
  const [aiResult, setAiResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mainEditor, setMainEditor] = useState(null)
  const [activeEditor, setActiveEditor] = useState('main')

  // Zoom-in state for partial refine
  const [zoomState, setZoomState] = useState(null)
  // zoomState = { fullHTML: string, selectedText: string, from: number, to: number }

  const isZoomed = zoomState !== null

  const currentEditor = activeEditor === 'ai' ? null : mainEditor

  const handleContentReady = useCallback(async (editor) => {
    const html = editor.getHTML()
    if (!html || html === '<p></p>') return

    setIsAnalyzing(true)
    try {
      const result = await analyzeText(html)
      setAiResult(result)
    } catch (err) {
      console.error('AI analysis failed:', err)
      alert('AI analysis failed: ' + err.message)
    }
    setIsAnalyzing(false)
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
    setIsAnalyzing(true)
    try {
      const result = await analyzeText(html, instruction || null)
      setAiResult(result)
    } catch (err) {
      console.error('AI refine failed:', err)
    }
    setIsAnalyzing(false)
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
    setIsAnalyzing(true)
    try {
      const prompt = instruction
        ? `Improve this text: "${selectedText}"\nInstruction: ${instruction}`
        : null
      const result = await analyzeText(`<p>${selectedText}</p>`, prompt)
      setAiResult(result)
    } catch (err) {
      console.error('AI refine failed:', err)
    }
    setIsAnalyzing(false)
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
    mainEditor.commands.focus()
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
          <div className="paper">
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
                <FloatingRefine
                  editor={mainEditor}
                  onSubmit={handleFloatingRefine}
                />
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

          <AIInput
            onSubmit={handleRefine}
            isLoading={isAnalyzing}
            editor={mainEditor}
          />
        </section>

        <aside className="col-insight" aria-label="Suggestions">
          <InsightPanel
            result={aiResult}
            isLoading={isAnalyzing}
          />
        </aside>
      </main>
    </div>
  )
}
