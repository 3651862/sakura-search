import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KnowledgeItem } from '../types'
import { useTheme } from '../themes'

interface KnowledgeCardProps {
  items: KnowledgeItem[]
  fullAnswer: string
  reasoning?: string
  isStreaming?: boolean
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  items,
  fullAnswer,
  reasoning,
  isStreaming,
}) => {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState(false)

  if (isStreaming) {
    return (
      <div className="p-4 pb-3">
        <div className="glass-card p-3.5 shadow-sakura relative overflow-hidden">
          <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `linear-gradient(to bottom, ${theme.knowledgeBorder}, ${theme.accent}, ${theme.knowledgeBorder})` }} />
          <div className="flex items-center gap-2 mb-2.5 pl-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sakura" style={{ background: `linear-gradient(to bottom right, ${theme.knowledgeBorder}, ${theme.accent})` }}>
              <span className="text-white text-[9px] font-bold">🌸</span>
            </div>
            <span className="text-[12px] font-medium tracking-wide" style={{ color: theme.text }}>AI 正在思考...</span>
          </div>
          <div className="pl-3">
            <p className={isStreaming ? 'streaming-cursor' : ''} style={{ color: theme.text, fontSize: '14px', lineHeight: '1.7' }}>
              {fullAnswer}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-3">
      <div className="glass-card p-3.5 shadow-sakura relative overflow-hidden" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `linear-gradient(to bottom, ${theme.knowledgeBorder}, ${theme.accent}, ${theme.knowledgeBorder})` }} />

        <div className="flex items-center gap-2 mb-2.5 pl-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sakura" style={{ background: `linear-gradient(to bottom right, ${theme.knowledgeBorder}, ${theme.accent})` }}>
            <span className="text-white text-[9px] font-bold">🌸</span>
          </div>
          <span className="text-[12px] font-medium tracking-wide" style={{ color: theme.text }}>关键知识</span>
        </div>

        <div className="space-y-2 pl-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-3.5 py-2.5 rounded-xl"
              style={{
                background: theme.knowledgeBg,
                borderLeft: `3px solid ${theme.knowledgeBorder}`,
                color: theme.text,
                fontSize: '13px',
                lineHeight: '1.7',
              }}
            >
              <strong>{item.key}：</strong>{item.value}
            </motion.div>
          ))}
        </div>

        {/* 展开完整回答 */}
        <div className="pl-3 mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] transition-colors hover:opacity-80"
            style={{ color: theme.accent }}
          >
            {expanded ? '收起完整回答 ↑' : '查看完整回答 →'}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-3 mt-2"
            >
              {reasoning && (
                <details className="mb-2.5 group">
                  <summary className="text-[11px] cursor-pointer hover:opacity-80 select-none flex items-center gap-1" style={{ color: theme.text, opacity: 0.5 }}>
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    思考过程
                  </summary>
                  <p className="mt-1.5 text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: theme.text, opacity: 0.4 }}>
                    {reasoning}
                  </p>
                </details>
              )}
              <p className="text-[14px] leading-relaxed font-light" style={{ color: theme.text, opacity: 0.7 }}>
                {fullAnswer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}