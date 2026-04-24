import React from 'react'
import { X, Minus, Flower2, Search, BookOpen, Settings } from 'lucide-react'
import { TabType } from '../App'
import { useTheme, themes, ThemeName } from '../themes'

interface TitleBarProps {
  onClose: () => void
  onMinimize: () => void
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export const TitleBar: React.FC<TitleBarProps> = ({ onClose, onMinimize, activeTab, onTabChange }) => {
  const { themeName, setThemeName } = useTheme()
  const tabs: { key: TabType; icon: React.ReactNode; label: string }[] = [
    { key: 'search', icon: <Search className="w-3 h-3" />, label: '搜索' },
    { key: 'knowledge', icon: <BookOpen className="w-3 h-3" />, label: '知识库' },
    { key: 'settings', icon: <Settings className="w-3 h-3" />, label: '设置' },
  ]

  return (
    <div className="flex flex-col">
      {/* 标题栏 */}
      <div
        data-tauri-drag-region
        className="h-8 flex items-center justify-between px-3 cursor-move select-none"
      >
        <div data-tauri-drag-region className="flex items-center gap-1.5">
          <Flower2 className="w-3.5 h-3.5 text-sakura-400 animate-petal-sway" />
          <span data-tauri-drag-region className="text-[11px] text-warm-300 font-light tracking-widest uppercase">
            Sakura
          </span>
        </div>

        {/* 主题切换 */}
        <div className="flex items-center gap-1 mr-2">
          {(Object.keys(themes) as ThemeName[]).map(name => (
            <button
              key={name}
              onClick={() => setThemeName(name)}
              className="w-4 h-4 rounded-full border-2 transition-all hover:scale-110"
              style={{
                background: themes[name].switcherGradient,
                borderColor: themeName === name ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                boxShadow: themeName === name ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
              }}
              title={themes[name].label}
            />
          ))}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-lg hover:bg-warm-100/60 transition-colors"
            title="最小化"
          >
            <Minus className="w-3 h-3 text-warm-300" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-red-50/60 transition-colors group"
            title="关闭"
          >
            <X className="w-3 h-3 text-warm-300 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Tab 栏 */}
      <div className="flex px-4 gap-0.5 border-b border-warm-100/60">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-t-lg transition-all
              ${activeTab === tab.key
                ? 'text-sakura-500 bg-sakura-50/50 border-b-2 border-sakura-300 font-normal'
                : 'text-warm-300 hover:text-warm-400 hover:bg-warm-50/40 font-light'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
