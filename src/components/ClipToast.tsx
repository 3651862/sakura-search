import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ClipToastProps {
  visible: boolean
  tagCount: number
}

export const ClipToast: React.FC<ClipToastProps> = ({ visible, tagCount }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border"
            style={{
              background: 'linear-gradient(135deg, #fef8fa, #fce4ec)',
              borderColor: 'rgba(244,114,182,0.25)',
              boxShadow: '0 4px 20px rgba(244,114,182,0.15)',
            }}
          >
            <span className="text-base">🌸</span>
            <span className="text-[12px] font-medium text-sakura-500">已剪藏</span>
            <span className="text-[11px] text-warm-400 font-light">
              AI 已提取 {tagCount} 个知识点 → 剪藏库
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
