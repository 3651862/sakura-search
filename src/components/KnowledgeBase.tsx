import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trash2, RefreshCw, X } from 'lucide-react'
import { KnowledgeRecord } from '../types'
import { loadKnowledgeRecords, deleteKnowledgeRecord, updateKnowledgeRecord } from '../services/storage'
import { useTheme } from '../themes'

const REVIEW_INTERVALS = [1, 3, 7, 14, 30]

function getNextReviewAt(currentNextReviewAt: number, remembered: boolean): number {
  const now = Date.now()
  if (!remembered) {
    return now + 1 * 24 * 60 * 60 * 1000
  }
  const currentInterval = Math.round((currentNextReviewAt - now) / (24 * 60 * 60 * 1000))
  const currentIndex = REVIEW_INTERVALS.indexOf(Math.abs(currentInterval))
  const nextIndex = Math.min(currentIndex + 1, REVIEW_INTERVALS.length - 1)
  return now + REVIEW_INTERVALS[nextIndex] * 24 * 60 * 60 * 1000
}

export const KnowledgeBase: React.FC = () => {
  const { theme } = useTheme()
  const [records, setRecords] = useState<KnowledgeRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  useEffect(() => {
    refreshRecords()
  }, [])

  const refreshRecords = async () => {
    try {
      const data = await loadKnowledgeRecords()
      setRecords(data)
    } catch {
      setRecords([])
    }
  }

  const filtered = searchQuery
    ? records.filter(r =>
        r.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.items.some(item =>
          item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : records

  const selectedRecord = records.find(r => r.id === selectedId)
  const dueForReview = records.filter(r => r.nextReviewAt <= Date.now())

  const handleDelete = async (id: string) => {
    await deleteKnowledgeRecord(id)
    if (selectedId === id) setSelectedId(null)
    await refreshRecords()
  }

  const handleDeleteItem = async (recordId: string, itemIndex: number) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return
    const newItems = record.items.filter((_, i) => i !== itemIndex)
    if (newItems.length === 0) {
      await handleDelete(recordId)
    } else {
      await updateKnowledgeRecord(recordId, { items: newItems })
      await refreshRecords()
    }
  }

  const handleReview = async (id: string, remembered: boolean) => {
    const record = records.find(r => r.id === id)
    if (!record) return
    const nextReviewAt = getNextReviewAt(record.nextReviewAt, remembered)
    const reviewCount = remembered ? record.reviewCount + 1 : 0
    await updateKnowledgeRecord(id, { nextReviewAt, reviewCount })
    setReviewingId(null)
    await refreshRecords()
  }

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const isDue = (record: KnowledgeRecord) => record.nextReviewAt <= Date.now()

  return (
    <div className="flex h-full min-h-[500px]">
      {/* 左侧列表 */}
      <div className="w-[180px] border-r border-warm-100/40 flex flex-col">
        {/* 搜索 */}
        <div className="p-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-warm-50/60 rounded-xl border border-warm-100/40">
            <Search className="w-3 h-3 text-warm-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索知识点..."
              className="flex-1 bg-transparent text-[11px] text-warm-600 outline-none placeholder:text-warm-300 font-light"
            />
          </div>
        </div>

        {/* 复习提醒 */}
        {dueForReview.length > 0 && (
          <div className="px-2.5 pb-2">
            <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-50/40 px-2.5 py-1.5 rounded-lg border border-amber-100/30">
              <RefreshCw className="w-3 h-3" />
              <span>{dueForReview.length} 条待复习</span>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(record => (
            <button
              key={record.id}
              onClick={() => { setSelectedId(record.id); setReviewingId(null) }}
              className={`
                w-full text-left px-3 py-2.5 border-b border-warm-50/40 transition-all
                ${selectedId === record.id
                  ? 'bg-sakura-50/40 border-l-2 border-l-sakura-300'
                  : 'hover:bg-warm-50/30'
                }
              `}
            >
              <div className="flex items-start gap-1.5">
                {isDue(record) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 animate-glow-pulse" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-warm-600 truncate">{record.query}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.items.slice(0, 2).map((item, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded-full truncate max-w-[70px]"
                        style={{
                          background: theme.tagBg,
                          color: theme.tagText,
                          border: `1px solid ${theme.tagBorder}`,
                        }}
                      >
                        {item.key}
                      </span>
                    ))}
                    {record.items.length > 2 && (
                      <span className="text-[9px] text-warm-300">+{record.items.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-[11px] text-warm-300 py-8 font-light">
              {searchQuery ? '没有匹配的知识点' : '暂无知识记录'}
            </div>
          )}
        </div>
      </div>

      {/* 右侧详情 */}
      <div className="flex-1 overflow-y-auto">
        {selectedRecord ? (
          <div className="p-4">
            {/* 查询和时间 */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-medium text-warm-700">{selectedRecord.query}</h2>
                <p className="text-[11px] text-warm-300 mt-1 font-light">{formatDate(selectedRecord.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1">
                {isDue(selectedRecord) && (
                  <button
                    onClick={() => setReviewingId(selectedRecord.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-amber-600 bg-amber-50/40 rounded-lg hover:bg-amber-100/50 transition-colors border border-amber-100/30"
                  >
                    <RefreshCw className="w-3 h-3" />
                    复习
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedRecord.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50/50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5 text-warm-300 hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* 知识点标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedRecord.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px]"
                    style={{
                      background: theme.tagBg,
                      color: theme.tagText,
                      border: `1px solid ${theme.tagBorder}`,
                    }}
                  >
                    <strong>{item.key}：</strong>{item.value}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(selectedRecord.id, index)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warm-200/80 text-warm-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* 复习面板 */}
            <AnimatePresence>
              {reviewingId === selectedRecord.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 bg-amber-50/30 border border-amber-100/40 rounded-xl"
                >
                  <p className="text-[12px] text-amber-600 mb-2.5 font-light">复习这些知识点：</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedRecord.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-amber-100/30 text-amber-700"
                      >
                        {item.key}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(selectedRecord.id, true)}
                      className="px-3.5 py-1.5 text-[11px] text-green-600 bg-green-50/50 rounded-lg hover:bg-green-100/50 transition-colors border border-green-100/30 font-light"
                    >
                      记住了
                    </button>
                    <button
                      onClick={() => handleReview(selectedRecord.id, false)}
                      className="px-3.5 py-1.5 text-[11px] text-red-400 bg-red-50/40 rounded-lg hover:bg-red-100/50 transition-colors border border-red-100/30 font-light"
                    >
                      忘了
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[12px] text-warm-300 font-light">
            选择一条记录查看知识点
          </div>
        )}
      </div>
    </div>
  )
}