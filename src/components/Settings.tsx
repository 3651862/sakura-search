import React, { useState, useEffect, useCallback } from 'react'
import { Keyboard } from 'lucide-react'
import { ShortcutSettings, DEFAULT_SHORTCUTS } from '../types'
import { loadSettings, saveSettings } from '../services/storage'
import { invoke } from '@tauri-apps/api/tauri'

export const Settings: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutSettings>(DEFAULT_SHORTCUTS)
  const [editingKey, setEditingKey] = useState<keyof ShortcutSettings | null>(null)

  useEffect(() => {
    loadSettings().then(setShortcuts)
  }, [])

  const shortcutLabels: Record<keyof ShortcutSettings, string> = {
    toggleWindow: '唤起/隐藏窗口',
    clearSearch: '清空搜索框',
    closeWindow: '关闭窗口',
    focusSearch: '聚焦搜索框',
    clipShortcut: '剪藏快捷键',
  }

  const formatShortcut = (shortcut: string) => {
    return shortcut
      .replace('Alt', '⌥ Alt')
      .replace('Ctrl', '⌃ Ctrl')
      .replace('Shift', '⇧ Shift')
      .replace('Space', '空格')
      .replace('+', ' + ')
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent, key: keyof ShortcutSettings) => {
    e.preventDefault()

    const parts: string[] = []
    if (e.altKey) parts.push('Alt')
    if (e.ctrlKey) parts.push('Ctrl')
    if (e.shiftKey) parts.push('Shift')

    const keyName = e.key === ' ' ? 'Space' :
      e.key === 'Escape' ? 'Escape' :
      e.key.length === 1 ? e.key.toUpperCase() : e.key

    if (!['Alt', 'Control', 'Shift'].includes(e.key)) {
      parts.push(keyName)
    }

    if (parts.length >= 2) {
      const newShortcut = parts.join('+')
      const oldShortcut = shortcuts[key]

      const updated = { ...shortcuts, [key]: newShortcut }
      setShortcuts(updated)
      setEditingKey(null)

      saveSettings(updated).catch(console.error)

      if (key === 'toggleWindow') {
        invoke('update_global_shortcut', { oldShortcut, newShortcut }).catch(console.error)
      }
    }
  }, [shortcuts])

  return (
    <div className="p-4">
      <h2 className="text-[14px] font-medium text-warm-600 mb-4">快捷键设置</h2>

      <div className="space-y-2">
        {(Object.keys(shortcutLabels) as Array<keyof ShortcutSettings>).map(key => (
          <div
            key={key}
            className="flex items-center justify-between p-3 bg-warm-50/40 rounded-xl border border-warm-100/30"
          >
            <span className="text-[13px] text-warm-500 font-light">{shortcutLabels[key]}</span>

            {editingKey === key ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sakura-50/50 border border-sakura-200/40 rounded-lg">
                <Keyboard className="w-3 h-3 text-sakura-400" />
                <span className="text-[11px] text-sakura-500 font-light">按下新快捷键...</span>
              </div>
            ) : (
              <button
                onClick={() => setEditingKey(key)}
                className="px-2.5 py-1 bg-white/60 border border-warm-200/40 rounded-lg text-[12px] text-warm-400 hover:border-sakura-200 hover:text-sakura-500 transition-colors font-light"
              >
                {formatShortcut(shortcuts[key])}
              </button>
            )}

            {editingKey === key && (
              <input
                autoFocus
                className="absolute opacity-0 w-0 h-0"
                onKeyDown={(e) => handleKeyDown(e, key)}
                onBlur={() => setEditingKey(null)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-warm-50/30 rounded-xl border border-warm-100/20">
        <p className="text-[11px] text-warm-300 font-light">
          点击快捷键即可修改。按下组合键（如 Ctrl+Alt+K）完成设置。
        </p>
      </div>
    </div>
  )
}
