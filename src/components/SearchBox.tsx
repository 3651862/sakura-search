import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'

interface SearchBoxProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  autoFocus?: boolean
  placeholder?: string
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  isLoading = false,
  autoFocus = true,
  placeholder = "搜索任何问题...",
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="search-box-wrapper">
        <div className={`search-box-inner flex items-center gap-3 px-4 py-3 ${isLoading ? 'opacity-80' : ''}`}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5 text-sakura-400" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Search className="w-[18px] h-[18px] text-warm-400" />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isLoading ? '正在搜索...' : placeholder}
            disabled={isLoading}
            className="
              flex-1 bg-transparent outline-none
              text-warm-700 text-[15px] font-light
              placeholder:text-warm-300
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />

          {query && !isLoading && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[11px] text-warm-300 font-light px-2 py-0.5 bg-warm-100/50 rounded-md border border-warm-200/40"
            >
              ↵
            </motion.span>
          )}
        </div>
      </div>
    </form>
  )
}
