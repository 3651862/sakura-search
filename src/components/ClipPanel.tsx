import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trash2, X, Bookmark } from 'lucide-react'
import { ClipRecord } from '../types'
import { loadClipRecords, deleteClipRecord } from '../services/storage'
import { useTheme } from '../themes'

interface ClipPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const ClipPanel: React.FC<ClipPanelProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme()
  const [records, setRecords] = useState<ClipRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) refreshRecords()
  }, [isOpen])

  const refreshRecords = async () => {
    try {
      const data = await loadClipRecords()
      setRecords(data)
    } catch {
      setRecords([])
    }
  }

  const filtered = searchQuery
    ? records.filter(r =>
        r.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : records

  const handleDelete = async (id: string) => {
    await deleteClipRecord(id)
    if (expandedId === id) setExpandedId(null)
    await refreshRecords()
  }

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/5 z-20"
            onClick={onClose}
          />
          {/* 面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-0 bottom-0 w-[220px] bg-white/70 backdrop-blur-xl border-l border-warm-100/40 z-30 flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-warm-100/40">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-sakura-400" />
                <span className="text-[12px] font-medium text-warm-600">剪藏库</span>
                <span className="text-[10px] text-warm-300">{records.length}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-warm-100/60 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-warm-300" />
              </button>
            </div>

            {/* 搜索 */}
            <div className="px-2.5 py-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-warm-50/60 rounded-xl border border-warm-100/40">
                <Search className="w-3 h-3 text-warm-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索剪藏..."
                  className="flex-1 bg-transparent text-[11px] text-warm-600 outline-none placeholder:text-warm-300 font-light"
                />
              </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto px-2.5 pb-2">
              {filtered.map(record => (
                <div key={record.id} className="mb-1.5">
                  <button
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/60 border border-warm-100/30 hover:bg-warm-50/60 transition-all"
                  >
                    <div className="text-[12px] text-warm-600 font-medium truncate">{record.query}</div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {record.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: theme.tagBg,
                            color: theme.tagText,
                            border: `1px solid ${theme.tagBorder}`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {record.tags.length > 3 && (
                        <span className="text-[9px] text-warm-300">+{record.tags.length - 3}</span>
                      )}
                    </div>
                    <div className="text-[9px] text-warm-300 mt-1">{formatDate(record.createdAt)}</div>
                  </button>

                  {/* 展开详情 */}
                  {expandedId === record.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 p-2.5 rounded-xl bg-white/40 border border-sakura-100/20"
                    >
                      {record.tags.map((tag, i) => (
                        <div key={i} className="mb-1.5 last:mb-0">
                          <span
                            className="inline-block text-[10px] px-2 py-0.5 rounded-full mr-1"
                            style={{
                              background: theme.tagBg,
                              color: theme.tagText,
                              border: `1px solid ${theme.tagBorder}`,
                            }}
                          >
                            {tag}
                          </span>
                          <span className="text-[11px] text-warm-500 font-light">{record.content[i]}</span>
                        </div>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(record.id) }}
                        className="mt-2 flex items-center gap-1 text-[10px] text-warm-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>删除</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center text-[11px] text-warm-300 py-8 font-light">
                  {searchQuery ? '没有匹配的剪藏' : '暂无剪藏记录'}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
