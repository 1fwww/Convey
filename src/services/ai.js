// Set your API key here for local dev (do NOT commit)
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''

const SYSTEM_PROMPT = `You are a writing assistant for non-native English professionals (primarily Chinese-speaking, working in US tech). The user will give you a piece of workplace writing (Slack message, email, etc).

CRITICAL RULES:
- Make MINIMAL, SURGICAL changes. Change only the words that need changing. Keep everything else EXACTLY as the user wrote it.
- Do NOT rephrase sentences that are already correct. Do NOT rewrite for style if grammar is fine.
- Do NOT make it more formal. The user writes casually in Slack — respect that.
- Every change should be a specific fix: a word swap, an added article, a tense correction. Prefer targeted fixes over sentence rewrites.
- If the text is already good, say so and make zero or few changes.

Your job:
1. Provide a revised version with the necessary fixes applied. Keep as much of the original wording as possible.
2. For the revisedHTML field: wrap ONLY the changed words in diff spans. Added words: <span class='diff-add'>word</span>. Removed words: <span class='diff-remove'>word</span>. Everything else stays as plain text.
3. Identify each specific change and explain WHY briefly. Relate to Chinese-English differences when relevant.
4. Note what the user did well (affirm before suggesting).

Return ONLY valid JSON in this exact format:
{
  "revised": "The improved text — keep as close to original as possible",
  "revisedHTML": "Same text with ONLY changed words wrapped in diff spans",
  "affirm": "One sentence about what's working well in the original",
  "changes": [
    {
      "original": "the exact word or short phrase that was changed",
      "revised": "the replacement word or short phrase",
      "category": "grammar|naturalness|style|clarity",
      "explanation": "Why this change matters, in 1-2 sentences."
    }
  ]
}`

const REFINE_SYSTEM_PROMPT = `You are a writing assistant. The user has a piece of text and wants a specific refinement. Apply their instruction while keeping the same output format.

Return ONLY valid JSON in this exact format:
{
  "revised": "The refined text as plain text",
  "revisedHTML": "The refined text as HTML with changes highlighted using <span class='diff-add'>added</span> and <span class='diff-remove'>removed</span>",
  "affirm": "Brief positive note",
  "changes": [
    {
      "original": "original phrase",
      "revised": "revised phrase",
      "category": "grammar|naturalness|style|clarity",
      "explanation": "Brief explanation"
    }
  ]
}`

export async function analyzeText(html, instruction = null) {
  // For development: use mock data if no API key
  if (!ANTHROPIC_API_KEY) {
    return getMockResult()
  }

  const systemPrompt = instruction ? REFINE_SYSTEM_PROMPT : SYSTEM_PROMPT
  const userMessage = instruction
    ? `Text:\n${stripHTML(html)}\n\nInstruction: ${instruction}`
    : `Text:\n${stripHTML(html)}`

  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('API error:', response.status, errText)
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  console.log('AI raw response:', data)
  const text = data.content?.[0]?.text
  if (!text) throw new Error('No response from AI')

  console.log('AI text:', text)

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response format: ' + text.substring(0, 200))

  const parsed = JSON.parse(jsonMatch[0])
  console.log('AI parsed:', parsed)
  return parsed
}

function stripHTML(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

function getMockResult() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        revised: "I just learned from Katie that we should no longer have social icons in the email footer. This is what it should look like (see screenshot). Sharing in case you didn't know either.",
        revisedHTML: 'I just <span class="diff-add">learned</span> from Katie that we should no longer have social icons in <span class="diff-add">the</span> email footer. <span class="diff-remove">And this</span> <span class="diff-add">This</span> is what it should <span class="diff-remove">be</span> <span class="diff-add">look like</span> (see screenshot). Sharing in case you didn\'t know <span class="diff-add">either</span>.',
        affirm: "Clear intent, good casual tone. \"Sharing in case you also didn't know\" — nice collaborative touch.",
        changes: [
          {
            original: "knew",
            revised: "learned",
            category: "grammar",
            explanation: "中文\"刚知道\"自然对应 \"just knew\"，但英文里 \"knew\" 是持续状态（I knew it all along）。表达\"刚得知\"要用 learned 或 found out。"
          },
          {
            original: "in email footer",
            revised: "in the email footer",
            category: "naturalness",
            explanation: "指代一个具体的、双方都知道的东西时，英文用 \"the\"。中文没有冠词，这个点需要靠语感积累。"
          },
          {
            original: "And this is what it should be",
            revised: "This is what it should look like",
            category: "style",
            explanation: "短消息里 \"And\" 开头会让句子显得 run-on。去掉更干脆。指代截图时 \"look like\" 比 \"be\" 更具体。"
          }
        ]
      })
    }, 800) // Simulate API delay
  })
}
