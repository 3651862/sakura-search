import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface CherryBlossomProps {
  count?: number
  petalColors?: string[]
}

// 真实樱花5瓣花形 SVG path
const SAKURA_PETAL_PATH = `M12 2.5c-.8 2-2.5 3.5-4.5 4 2 .5 3.5 2 4.5 4 1-2 2.5-3.5 4.5-4-2-.5-3.7-2-4.5-4z
M4.5 6.5c-2 .3-3.8 1.5-4.5 3.5.8 1.8 2.5 3 4.5 3.5-.3-2 .2-3.8 1.5-5.5-0.5-.5-1-.8-1.5-1.5z
M19.5 6.5c2 .3 3.8 1.5 4.5 3.5-.8 1.8-2.5 3-4.5 3.5.3-2-.2-3.8-1.5-5.5.5-.5 1-.8 1.5-1.5z
M6 17.5c-.5 2-1.8 3.5-3.5 4.5 1.8.3 3.5-.2 5-1.5-.5-.8-1-1.8-1.5-3z
M18 17.5c.5 2 1.8 3.5 3.5 4.5-1.8.3-3.5-.2-5-1.5.5-.8 1-1.8 1.5-3z`

export const CherryBlossom: React.FC<CherryBlossomProps> = ({ count = 12, petalColors }) => {
  const blossoms = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      initialX: Math.random() * 100,
      size: 14 + Math.random() * 12,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      swayAmplitude: 20 + Math.random() * 30,
      rotation: Math.random() * 360,
      // 随机选择花瓣色调
      color: petalColors?.[Math.floor(Math.random() * (petalColors.length || 3))] || ['text-sakura-200', 'text-sakura-300', 'text-sakura-100'][Math.floor(Math.random() * 3)],
      // 不同层次：远处的更小更透明
      depth: Math.random(),
    }))
  }, [count])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 柔和的大气渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-sakura-50/30 via-transparent to-sakura-100/20" />

      {/* 光晕点 */}
      <div className="absolute top-[10%] right-[15%] w-40 h-40 bg-sakura-200/15 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-[20%] left-[10%] w-28 h-28 bg-sakura-100/20 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      {blossoms.map((blossom) => {
        // 深度感：远处的更小更透明
        const opacity = 0.12 + blossom.depth * 0.22
        const blur = blossom.depth < 0.3 ? 1.5 : blossom.depth < 0.6 ? 0.8 : 0

        return (
          <motion.div
            key={blossom.id}
            className="absolute"
            style={{
              left: `${blossom.initialX}%`,
              top: -30,
              fontSize: blossom.size,
              opacity,
              filter: blur > 0 ? `blur(${blur}px)` : 'none',
            }}
            animate={{
              y: ['0vh', '115vh'],
              x: [
                0,
                Math.sin(blossom.id * 1.3) * blossom.swayAmplitude,
                -Math.sin(blossom.id * 0.7) * blossom.swayAmplitude * 0.6,
                Math.sin(blossom.id * 2.1) * blossom.swayAmplitude * 0.3,
                0,
              ],
              rotate: [
                blossom.rotation,
                blossom.rotation + 140,
                blossom.rotation + 300,
                blossom.rotation + 500,
              ],
              opacity: [0, opacity, opacity, 0],
            }}
            transition={{
              duration: blossom.duration,
              repeat: Infinity,
              delay: blossom.delay,
              ease: 'linear',
            }}
          >
            <svg
              width={blossom.size}
              height={blossom.size}
              viewBox="0 0 24 24"
              fill="currentColor"
              className={blossom.color}
            >
              {/* 5瓣樱花 */}
              <path d={SAKURA_PETAL_PATH} />
              {/* 花芯 */}
              <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" className="text-sakura-400" />
            </svg>
          </motion.div>
        )
      })}

      {/* 底部淡出 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-warm-50/80 to-transparent pointer-events-none" />
    </div>
  )
}
