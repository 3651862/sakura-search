import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CherryBlossom } from './components/CherryBlossom'
import { TitleBar } from './components/TitleBar'
import { SearchBox } from './components/SearchBox'
import { SearchResults } from './components/SearchResults'
import { ClipPanel } from './components/ClipPanel'
import { ClipToast } from './components/ClipToast'
import { Settings } from './components/Settings'
import { TranslatePanel } from './components/TranslatePanel'
import { searchWithTavily, TavilySearchResult } from './services/tavily'
import { streamSummary, StepfunMessage, extractKnowledge } from './services/stepfun'
import { addSearchRecord, loadHistory, updateSearchRecord, addClipRecord, loadClipRecords, loadSettings, saveSettings } from './services/storage'
import { FollowUpMessage, ClipRecord } from './types'
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { themes, ThemeContext, ThemeName } from './themes'
import { DecoLayer } from './components/DecoLayer'
import { SakuraCursor } from './components/SakuraCursor'

interface SearchResult {
  query: string
  aiAnswer: string
  reasoning?: string
  webResults: TavilySearchResult[]
  isLocalMatch?: boolean
}

type SearchStatus = 'idle' | 'searching' | 'streaming' | 'success' | 'error'

export type TabType = 'search' | 'translate' | 'settings'

function App() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [followUpMessages, setFollowUpMessages] = useState<FollowUpMessage[]>([])
  const [followUpStreaming, setFollowUpStreaming] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('search')
  const [themeName, setThemeName] = useState<ThemeName>('sakura')
  const [clipMatches, setClipMatches] = useState<ClipRecord[]>([])
  const [clipPanelOpen, setClipPanelOpen] = useState(false)
  const [clipToastVisible, setClipToastVisible] = useState(false)
  const [clipToastCount, setClipToastCount] = useState(0)
  const theme = themes[themeName]

  useEffect(() => {
    loadSettings().then(s => {
      if ((s as any).theme && (s as any).theme in themes) {
        setThemeName((s as any).theme)
      }
    }).catch(() => {})
  }, [])

  const handleSetThemeName = useCallback((name: ThemeName) => {
    setThemeName(name)
    loadSettings().then(s => saveSettings({ ...s, theme: name } as any)).catch(() => {})
  }, [])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setStatus('searching')
    setQuery(searchQuery)
    setResults(null)
    setError(null)
    setFollowUpMessages([])
    setFollowUpStreaming(false)
    setClipMatches([])

    // Local First：先查本地剪藏
    try {
      const records = await loadClipRecords()
      const queryLower = searchQuery.toLowerCase()
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0)
      const matches = records.filter(r => {
        const searchable = [r.query, ...r.tags, ...r.content].join(' ').toLowerCase()
        const matchCount = queryWords.filter(w => searchable.includes(w)).length
        return matchCount / queryWords.length >= 0.4
      }).slice(0, 3)
      if (matches.length > 0) setClipMatches(matches)

      // 高匹配度 → 零延迟回答，不调 API
      const strongMatches = records.filter(r => {
        const queryText = r.query.toLowerCase()
        // 查询词全部命中，或原 query 高度相似
        const allWordsMatch = queryWords.every(w => queryText.includes(w))
        const querySimilar = queryLower.includes(queryText) || queryText.includes(queryLower)
        return allWordsMatch || querySimilar
      })

      if (strongMatches.length > 0) {
        const best = strongMatches[0]
        const noteLine = best.note ? `\n\n💬 ${best.note}` : ''
        const localAnswer = best.content.join('；') + noteLine
        setResults({
          query: searchQuery,
          aiAnswer: localAnswer,
          webResults: [],
          isLocalMatch: true,
        })
        setStatus('success')
        return
      }
    } catch {}

    try {
      const tavilyResult = await searchWithTavily(searchQuery)

      if (!tavilyResult.results || tavilyResult.results.length === 0) {
        throw new Error('未找到相关搜索结果')
      }

      setStatus('streaming')

      const systemPrompt = `你是一个智能搜索助手。基于搜索结果提供准确、简洁的回答。

规则：
1. 综合多个来源给出清晰回答
2. 如有冲突信息请指出
3. 回答简洁明了
4. 使用中文回答

注意：信息不足时说明"无法完全回答"，不要编造信息。`

      const searchResultsText = tavilyResult.results
        .map((r: TavilySearchResult, i: number) => `[${i + 1}] ${r.title}\n${r.content}\n`)
        .join('\n')

      const userPrompt = `问题: ${searchQuery}\n\n搜索结果:\n${searchResultsText}\n\n请提供准确简洁的回答。`

      let aiAnswer = ''
      let reasoning = ''

      await streamSummary(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          onReasoning: (token) => {
            reasoning += token
            setResults({
              query: searchQuery,
              aiAnswer,
              reasoning,
              webResults: tavilyResult.results,
            })
          },
          onToken: (token) => {
            aiAnswer += token
            setResults({
              query: searchQuery,
              aiAnswer,
              reasoning,
              webResults: tavilyResult.results,
            })
          },
          onDone: (fullText, finalReasoning) => {
            setResults({
              query: searchQuery,
              aiAnswer: fullText,
              reasoning: finalReasoning,
              webResults: tavilyResult.results,
            })
            setStatus('success')
            addSearchRecord({
              id: Date.now().toString(),
              query: searchQuery,
              results: tavilyResult.results.map((r: TavilySearchResult) => ({
                title: r.title,
                url: r.url,
                content: r.content,
                score: r.score,
              })),
              aiAnswer: fullText,
              messages: [],
              createdAt: Date.now(),
              nextReviewAt: Date.now() + 1 * 24 * 60 * 60 * 1000,
            }).catch(console.error)
          },
          onError: (err) => {
            setError(err.message)
            setStatus('error')
          },
        }
      )

    } catch (err) {
      console.error('搜索错误:', err)
      setError(err instanceof Error ? err.message : '搜索过程中发生错误')
      setStatus('error')
    }
  }, [])

  const handleClip = useCallback(async (aiAnswer: string, query: string, note?: string) => {
    try {
      const items = await extractKnowledge(aiAnswer)
      if (items.length > 0) {
        await addClipRecord({
          id: Date.now().toString(),
          query,
          tags: items.map(item => item.key),
          content: items.map(item => item.value),
          note: note?.trim() || undefined,
          createdAt: Date.now(),
        })
        setClipToastCount(items.length)
        setClipToastVisible(true)
        setTimeout(() => setClipToastVisible(false), 1500)
      }
    } catch (err) {
      console.error('剪藏失败:', err)
    }
  }, [])

  const handleFollowUp = useCallback(async (question: string) => {
    if (!results || followUpStreaming) return

    setFollowUpStreaming(true)

    const systemPrompt = `你是一个智能搜索助手。基于搜索结果提供准确、简洁的回答。

规则：
1. 综合多个来源给出清晰回答
2. 如有冲突信息请指出
3. 回答简洁明了
4. 使用中文回答

注意：信息不足时说明"无法完全回答"，不要编造信息。`

    const searchResultsText = results.webResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\n`)
      .join('\n')

    const messages: StepfunMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `问题: ${results.query}\n\n搜索结果:\n${searchResultsText}\n\n请提供准确简洁的回答。` },
      { role: 'assistant', content: results.aiAnswer },
    ]

    for (const msg of followUpMessages) {
      messages.push({ role: 'user', content: msg.question })
      messages.push({ role: 'assistant', content: msg.answer })
    }

    messages.push({ role: 'user', content: question })

    let answer = ''
    setFollowUpMessages(prev => [...prev, { question, answer: '' }])

    await streamSummary(messages, {
      onToken: (token) => {
        answer += token
        setFollowUpMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { question, answer }
          return updated
        })
      },
      onDone: (fullText) => {
        const updatedMessages = [...followUpMessages, { question, answer: fullText }]
        setFollowUpMessages(updatedMessages)
        setFollowUpStreaming(false)
        loadHistory().then(records => {
          const latestRecord = records.find(r => r.query === results?.query)
          if (latestRecord) {
            updateSearchRecord(latestRecord.id, { messages: updatedMessages }).catch(console.error)
          }
        }).catch(console.error)
      },
      onError: (err) => {
        setError(err.message)
        setFollowUpStreaming(false)
      },
    })
  }, [results, followUpMessages, followUpStreaming])

  const handleClose = useCallback(async () => {
    try {
      await appWindow.hide()
    } catch (err) {
      console.error('隐藏窗口失败:', err)
    }
  }, [])

  const handleMinimize = useCallback(async () => {
    try {
      await appWindow.minimize()
    } catch (err) {
      console.error('最小化窗口失败:', err)
    }
  }, [])

  // 剪藏快捷键监听
  useEffect(() => {
    const unlisten = listen('clip-shortcut-pressed', async () => {
      try {
        const text = await invoke<string>('read_clipboard')
        if (!text || !text.trim()) return

        await appWindow.show()
        await appWindow.setFocus()

        const items = await extractKnowledge(text)
        if (items.length > 0) {
          await addClipRecord({
            id: Date.now().toString(),
            query: text.slice(0, 50),
            tags: items.map(item => item.key),
            content: items.map(item => item.value),
            createdAt: Date.now(),
          })
          setClipToastCount(items.length)
          setClipToastVisible(true)
          setTimeout(() => setClipToastVisible(false), 1500)
        }
      } catch (err) {
        console.error('剪藏失败:', err)
      }
    })

    return () => { unlisten.then(fn => fn()) }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setQuery('')
        setResults(null)
        setStatus('idle')
      }
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="搜索"]')
        input?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  const themeValue = useMemo(() => ({
    theme,
    themeName,
    setThemeName: handleSetThemeName,
  }), [theme, themeName, handleSetThemeName])

  return (
    <ThemeContext.Provider value={themeValue}>
    <div
      className="relative min-h-screen w-full overflow-hidden rounded-xl"
      style={{
        background: theme.gradient,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      {/* 樱花背景 */}
      <CherryBlossom count={12} petalColors={theme.petalColors} />
      <DecoLayer />
      <SakuraCursor />

      {/* 主内容 */}
      <div className="relative z-10 flex flex-col h-full min-h-screen">
        <TitleBar
          onClose={handleClose}
          onMinimize={handleMinimize}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenClipPanel={() => setClipPanelOpen(true)}
        />

        <div className="flex-1 p-4 pt-2 overflow-hidden">
          {activeTab === 'search' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex flex-col"
            >
              <div className={results || status !== 'idle' ? 'mb-3' : 'mb-0'}>
                <SearchBox
                  onSearch={handleSearch}
                  isLoading={status === 'searching' || status === 'streaming'}
                  placeholder="搜索任何问题..."
                />
              </div>

              <AnimatePresence>
                {(status === 'searching' || status === 'streaming' || status === 'error') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <div className={`
                      flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[13px] font-light
                      ${status === 'error'
                        ? 'bg-red-50/50 text-red-400 border border-red-100/40'
                        : 'bg-sakura-50/30 text-sakura-400 border border-sakura-100/30'
                      }
                    `}>
                      {status === 'searching' && (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span>正在搜索网页...</span>
                        </>
                      )}
                      {status === 'streaming' && (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span>AI 正在回答...</span>
                        </>
                      )}
                      {status === 'error' && <span>{error || '搜索失败'}</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {results && (status === 'success' || status === 'streaming') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-y-auto"
                  >
                    <SearchResults
                      aiAnswer={results.aiAnswer}
                      reasoning={results.reasoning}
                      webResults={results.webResults}
                      isStreaming={status === 'streaming'}
                      isLocalMatch={results.isLocalMatch}
                      onFollowUp={handleFollowUp}
                      isFollowUpStreaming={followUpStreaming}
                      followUpMessages={followUpMessages}
                      clipMatches={clipMatches}
                      onClip={(note) => results && handleClip(results.aiAnswer, results.query, note)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'settings' && <Settings />}

          {activeTab === 'translate' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <TranslatePanel />
            </motion.div>
          )}
        </div>
      </div>

      {/* 剪藏面板 */}
      <ClipPanel isOpen={clipPanelOpen} onClose={() => setClipPanelOpen(false)} />

      {/* 剪藏成功提示 */}
      <ClipToast visible={clipToastVisible} tagCount={clipToastCount} />
    </div>
    </ThemeContext.Provider>
  )
}

export default App
