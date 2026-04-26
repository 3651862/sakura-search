import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, CheckCircle, Languages } from 'lucide-react'
import { streamSummary, StepfunMessage } from '../services/stepfun'

export const TranslatePanel: React.FC = () => {
  const [sourceText, setSourceText] = useState('')
  const [result, setResult] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTranslate = async () => {
    if (!sourceText.trim() || isStreaming) return

    setIsStreaming(true)
    setResult('')

    const messages: StepfunMessage[] = [
      {
        role: 'system',
        content: '你是一个翻译助手。将用户输入的文本翻译成中文。如果输入已经是中文，翻译成英文。只输出翻译结果，不要解释，不要加前缀。',
      },
      { role: 'user', content: sourceText.trim() },
    ]

    let translated = ''
    await streamSummary(messages, {
      onToken: (token) => {
        translated += token
        setResult(translated)
      },
      onDone: (fullText) => {
        setResult(fullText)
        setIsStreaming(false)
      },
      onError: () => {
        setIsStreaming(false)
      },
    })
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTranslate()
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* 源文本输入 */}
      <div className="glass-card p-3 shadow-sakura relative overflow-hidden flex-1 min-h-[120px]">
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-sakura-300 via-sakura-400 to-sakura-200" />
        <div className="flex items-center gap-2 mb-2 pl-3">
          <Languages className="w-4 h-4 text-sakura-400" />
          <span className="text-[12px] font-medium text-warm-500">输入文本</span>
          <span className="text-[10px] text-warm-300 ml-auto">回车翻译 · Shift+回车换行</span>
        </div>
        <textarea
          value={sourceText}
          onChange={e => setSourceText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="粘贴或输入要翻译的文本..."
          disabled={isStreaming}
          className="w-full h-[calc(100%-36px)] bg-transparent outline-none text-warm-700 text-[14px] leading-relaxed font-light placeholder:text-warm-300 resize-none disabled:opacity-50 pl-3"
        />
      </div>

      {/* 翻译结果 */}
      {(result || isStreaming) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 shadow-sakura relative overflow-hidden flex-1 min-h-[120px]"
        >
          <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-sakura-200 via-sakura-300 to-sakura-100" />
          <div className="flex items-center gap-2 mb-2 pl-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sakura-300 to-sakura-400 flex items-center justify-center shadow-sakura">
              <span className="text-white text-[8px] font-bold">译</span>
            </div>
            <span className="text-[12px] font-medium text-warm-500">翻译结果</span>
            {result && !isStreaming && (
              <button
                onClick={handleCopy}
                className="ml-auto p-1.5 rounded-lg hover:bg-warm-100/60 transition-colors"
                title={copied ? '已复制' : '复制'}
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5 text-sakura-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-warm-300 hover:text-warm-400" />
                )}
              </button>
            )}
          </div>
          <div className={`text-warm-700 text-[14px] leading-relaxed font-light pl-3 ${isStreaming ? 'streaming-cursor' : ''}`}>
            {result}
          </div>
        </motion.div>
      )}
    </div>
  )
}
