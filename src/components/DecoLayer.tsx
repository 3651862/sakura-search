import { useMemo } from 'react'
import { useTheme } from '../themes'

interface DecoItem {
  id: number
  symbol: string
  x: number
  y: number
  size: number
  opacity: number
  animation: 'float' | 'twinkle' | 'drift'
  delay: number
  duration: number
}

export const DecoLayer: React.FC = () => {
  const { theme } = useTheme()

  const decos = useMemo<DecoItem[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      symbol: theme.decorSymbols[i % theme.decorSymbols.length],
      x: Math.random() * 96 + 2,
      y: Math.random() * 90 + 5,
      size: 8 + Math.random() * 8,
      opacity: 0.2 + Math.random() * 0.2,
      animation: (['float', 'twinkle', 'drift'] as const)[i % 3],
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
    }))
  }, [theme.decorSymbols])

  const getAnimation = (item: DecoItem) => {
    switch (item.animation) {
      case 'float':
        return `decoFloat ${item.duration}s ease-in-out ${item.delay}s infinite`
      case 'twinkle':
        return `decoTwinkle ${item.duration}s ease-in-out ${item.delay}s infinite`
      case 'drift':
        return `decoDrift ${item.duration}s ease-in-out ${item.delay}s infinite`
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {decos.map(item => (
        <span
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: item.opacity,
            animation: getAnimation(item),
            color: theme.accent,
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  )
}