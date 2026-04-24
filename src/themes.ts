export type ThemeName = 'sakura' | 'sunset' | 'dream'

export interface Theme {
  name: ThemeName
  label: string
  gradient: string
  gradientAnimated: string
  accent: string
  text: string
  cardBg: string
  cardBorder: string
  petalColors: string[]
  decorSymbols: string[]
  knowledgeBg: string
  knowledgeBorder: string
  tagBg: string
  tagText: string
  tagBorder: string
  switcherGradient: string
}

export const themes: Record<ThemeName, Theme> = {
  sakura: {
    name: 'sakura',
    label: '樱花绽放',
    gradient: 'linear-gradient(135deg, #fef8fa 0%, #fdf0f4 25%, #fce4ec 50%, #f8bbd0 75%, #f48fb1 100%)',
    gradientAnimated: 'linear-gradient(135deg, #fef8fa 0%, #fdf0f4 25%, #fce4ec 50%, #f8bbd0 75%, #f48fb1 100%)',
    accent: '#ec407a',
    text: '#ad1457',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(244, 143, 177, 0.15)',
    petalColors: ['text-sakura-200', 'text-sakura-300', 'text-sakura-100'],
    decorSymbols: ['✿', '✦', '✧', '❀'],
    knowledgeBg: 'linear-gradient(135deg, rgba(254,248,250,0.8), rgba(252,228,236,0.5))',
    knowledgeBorder: '#f8bbd0',
    tagBg: 'linear-gradient(135deg, #fef8fa, #fce4ec)',
    tagText: '#c2185b',
    tagBorder: 'rgba(244,143,177,0.2)',
    switcherGradient: 'linear-gradient(135deg, #fef8fa, #f48fb1)',
  },
  sunset: {
    name: 'sunset',
    label: '暮樱晚霞',
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 25%, #fecdd3 50%, #fb7185 75%, #e11d48 100%)',
    gradientAnimated: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 25%, #fecdd3 50%, #fb7185 75%, #e11d48 100%)',
    accent: '#e11d48',
    text: '#9f1239',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(251, 113, 133, 0.15)',
    petalColors: ['text-rose-200', 'text-rose-300', 'text-rose-100'],
    decorSymbols: ['✿', '✦', '❀'],
    knowledgeBg: 'linear-gradient(135deg, rgba(255,241,242,0.8), rgba(254,205,211,0.5))',
    knowledgeBorder: '#fda4af',
    tagBg: 'linear-gradient(135deg, #fff1f2, #fecdd3)',
    tagText: '#be123c',
    tagBorder: 'rgba(251,113,133,0.2)',
    switcherGradient: 'linear-gradient(135deg, #fff1f2, #e11d48)',
  },
  dream: {
    name: 'dream',
    label: '夜樱梦幻',
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 25%, #f9a8d4 50%, #c084fc 75%, #8b5cf6 100%)',
    gradientAnimated: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 25%, #f9a8d4 50%, #c084fc 75%, #8b5cf6 100%)',
    accent: '#a855f7',
    text: '#86198f',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(192, 132, 252, 0.15)',
    petalColors: ['text-fuchsia-200', 'text-fuchsia-300', 'text-purple-100'],
    decorSymbols: ['✿', '✧', '❀', '✦'],
    knowledgeBg: 'linear-gradient(135deg, rgba(253,242,248,0.8), rgba(249,168,212,0.5))',
    knowledgeBorder: '#d946ef',
    tagBg: 'linear-gradient(135deg, #fdf2f8, #f5d0fe)',
    tagText: '#a21caf',
    tagBorder: 'rgba(192,132,252,0.2)',
    switcherGradient: 'linear-gradient(135deg, #fdf2f8, #8b5cf6)',
  },
}

import { createContext, useContext } from 'react'

interface ThemeContextValue {
  theme: Theme
  themeName: ThemeName
  setThemeName: (name: ThemeName) => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.sakura,
  themeName: 'sakura',
  setThemeName: () => {},
})

export const useTheme = () => useContext(ThemeContext)