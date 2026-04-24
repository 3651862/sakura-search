import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, Copy, CheckCircle } from 'lucide-react'
import { open } from '@tauri-apps/api/shell'
import { FollowUpMessage, KnowledgeItem, ClipRecord } from '../types'
import { KnowledgeCard } from './KnowledgeCard'

interface WebResult {
  title: string
  url: string
  content: string
  score?: number
}

interface SearchResultsProps {
  aiAnswer?: string
  reasoning?: string
  webResults: WebResult[]
  isStreaming?: boolean
  onFollowUp?: (question: string) => void
  isFollowUpStreaming?: boolean
  followUpMessages?: FollowUpMessage[]
  knowledgeItems?: KnowledgeItem[]
  clipMatches?: ClipRecord[]
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  aiAnswer,
  reasoning,
  webResults,
  isStreaming,
  onFollowUp,
  isFollowUpStreaming,
  followUpMessages,
  knowledgeItems,
  clipMatches,
}) => {
  const [copied, setCopied] = React.useState(false)
  const [webResultsExpanded, setWebResultsExpanded] = React.useState(true)

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenLink = async (url: string) => {
    await open(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="max-h-[420px] overflow-y-auto">
        {/* 智能回忆 - 剪藏匹配置顶 */}
        {clipMatches && clipMatches.length > 0 && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #f9a8d4, #f472b6)',
                  color: 'white',
                }}
              >
                剪藏
              </span>
              <span className="text-[11px] text-warm-300 font-light">你之前搜过相关内容</span>
            </div>

            {clipMatches.map(clip => (
              <div
                key={clip.id}
                className="p-3 rounded-xl mb-1.5 border"
                style={{
                  background: 'rgba(251,207,232,0.12)',
                  borderColor: 'rgba(244,114,182,0.15)',
                }}
              >
                <div className="text-[12px] text-warm-500 font-medium mb-1.5">{clip.query}</div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {clip.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-sakura-50/60 text-sakura-500 border border-sakura-100/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-warm-400 leading-relaxed font-light">
                  {clip.content.join('；')}
                </div>
                <div className="text-[9px] text-warm-300 mt-1.5">
                  {new Date(clip.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} 剪藏
                </div>
              </div>
            ))}

            {/* 折叠网络结果 */}
            <button
              onClick={() => setWebResultsExpanded(!webResultsExpanded)}
              className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 text-[11px] text-warm-300 hover:text-warm-400 transition-colors font-light"
            >
              <svg
                className={`w-3 h-3 transition-transform ${webResultsExpanded ? 'rotate-90' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span>补充网络结果</span>
            </button>
          </div>
        )}

        {/* AI 回答和网页结果 - 有剪藏匹配时受折叠控制 */}
        {(!clipMatches || clipMatches.length === 0 || webResultsExpanded) && <>
        {/* AI 回答 - 知识点精简模式 */}
        {aiAnswer && knowledgeItems && knowledgeItems.length > 0 && knowledgeItems.length <= 3 && !isStreaming && (
          <KnowledgeCard
            items={knowledgeItems}
            fullAnswer={aiAnswer}
            reasoning={reasoning}
            isStreaming={false}
          />
        )}

        {/* AI 回答 - 完整模式（复杂问题或无知识点） */}
        {aiAnswer && (!knowledgeItems || knowledgeItems.length === 0 || knowledgeItems.length > 3) && (
          <div className="p-4 pb-3">
            <div className="glass-card p-3.5 shadow-sakura relative overflow-hidden">
              {/* 左侧樱花色装饰线 */}
              <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-sakura-300 via-sakura-400 to-sakura-200" />

              <div className="flex items-center gap-2 mb-2.5 pl-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sakura-300 to-sakura-400 flex items-center justify-center shadow-sakura">
                  <span className="text-white text-[9px] font-bold">AI</span>
                </div>
                <span className="text-[12px] font-medium text-warm-500 tracking-wide">快速回答</span>
                <button
                  onClick={() => handleCopy(aiAnswer)}
                  className="ml-auto p-1.5 rounded-lg hover:bg-warm-100/60 transition-colors"
                  title={copied ? '已复制' : '复制'}
                >
                  {copied ? (
                    <CheckCircle className="w-3.5 h-3.5 text-sakura-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-warm-300 hover:text-warm-400" />
                  )}
                </button>
              </div>

              <div className="text-warm-700 text-[14px] leading-relaxed pl-3 font-light">
                {/* 思考过程 */}
                {reasoning && (
                  <details className="mb-2.5 group" open={isStreaming && !aiAnswer}>
                    <summary className="text-[11px] text-warm-300 cursor-pointer hover:text-warm-400 select-none flex items-center gap-1">
                      <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      思考过程
                    </summary>
                    <p className="mt-1.5 text-[12px] text-warm-300 leading-relaxed whitespace-pre-wrap">
                      {reasoning}
                      {isStreaming && !aiAnswer && <span className="streaming-cursor" />}
                    </p>
                  </details>
                )}
                <p className={isStreaming && aiAnswer ? 'streaming-cursor' : ''}>
                  {aiAnswer}
                </p>
              </div>

              {/* 追问对话 */}
              {followUpMessages && followUpMessages.length > 0 && (
                <div className="pl-3 space-y-3 mt-3">
                  {followUpMessages.map((msg, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-sakura-50 to-sakura-100/80 text-warm-700 text-[13px] px-3 py-1.5 rounded-xl rounded-tr-sm max-w-[85%] font-light">
                          {msg.question}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className={`text-warm-600 text-[13px] leading-relaxed max-w-[85%] font-light ${
                          isFollowUpStreaming && index === followUpMessages.length - 1 && !msg.answer ? '' :
                          isFollowUpStreaming && index === followUpMessages.length - 1 ? 'streaming-cursor' : ''
                        }`}>
                          {msg.answer || ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 追问输入框 */}
              {!isStreaming && onFollowUp && (
                <div className="pl-3 mt-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const input = e.currentTarget.querySelector('input')
                      if (input?.value.trim()) {
                        onFollowUp(input.value.trim())
                        input.value = ''
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="追问..."
                      disabled={isFollowUpStreaming}
                      className="flex-1 bg-warm-50/60 border border-warm-200/40 rounded-xl px-3 py-1.5 text-[13px] text-warm-600 outline-none focus:border-sakura-200 focus:bg-white/60 placeholder:text-warm-300 disabled:opacity-50 font-light transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isFollowUpStreaming}
                      className="p-1.5 rounded-xl bg-gradient-to-r from-sakura-100 to-sakura-200/80 text-sakura-500 hover:from-sakura-200 hover:to-sakura-300/80 transition-all disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 网页结果 */}
        {webResults.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-warm-300" />
              <span className="text-[12px] text-warm-400 font-light">来源</span>
              <span className="text-[10px] text-warm-300">({webResults.length})</span>
            </div>

            <div className="space-y-1.5">
              {webResults.map((result, index) => (
                <motion.div
                  key={result.url}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group"
                >
                  <button
                    onClick={() => handleOpenLink(result.url)}
                    className="w-full text-left p-3 rounded-xl hover:bg-warm-50/60 transition-all group-hover:shadow-warm"
                  >
                    <div className="flex items-start gap-2.5">
                      <ExternalLink className="w-3.5 h-3.5 text-warm-200 mt-0.5 flex-shrink-0 group-hover:text-sakura-400 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-medium text-warm-600 group-hover:text-sakura-500 transition-colors truncate">
                          {result.title}
                        </h3>
                        <p className="text-[11px] text-warm-300 mt-0.5 truncate">
                          {new URL(result.url).hostname}
                        </p>
                        <p className="text-[12px] text-warm-400 mt-1 line-clamp-2 leading-relaxed font-light">
                          {result.content}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        </>} {/* end webResultsExpanded conditional */}
      </div>
    </motion.div>
  )
}
