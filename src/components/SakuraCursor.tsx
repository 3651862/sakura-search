import { useEffect, useRef } from 'react'

// 粉色系色值
const PINK_COLORS = ['#f9a8d4', '#f472b6', '#fb7185', '#fda4af', '#fbcfe8', '#fecdd3']

// 三种形状 SVG：樱花、星星、爱心
const SHAPES = [
  // 樱花（5瓣）
  `<svg viewBox="0 0 24 24" fill="COLOR"><path d="M12 2.5c-.8 2-2.5 3.5-4.5 4 2 .5 3.5 2 4.5 4 1-2 2.5-3.5 4.5-4-2-.5-3.7-2-4.5-4z M4.5 6.5c-2 .3-3.8 1.5-4.5 3.5.8 1.8 2.5 3 4.5 3.5-.3-2 .2-3.8 1.5-5.5-.5-.5-1-.8-1.5-1.5z M19.5 6.5c2 .3 3.8 1.5 4.5 3.5-.8 1.8-2.5 3-4.5 3.5.3-2-.2-3.8-1.5-5.5.5-.5 1-.8 1.5-1.5z M6 17.5c-.5 2-1.8 3.5-3.5 4.5 1.8.3 3.5-.2 5-1.5-.5-.8-1-1.8-1.5-3z M18 17.5c.5 2 1.8 3.5 3.5 4.5-1.8.3-3.5-.2-5-1.5.5-.8 1-1.8 1.5-3z"/><circle cx="12" cy="12" r="1.5" fill="COLOR" opacity="0.3"/></svg>`,
  // 星星
  `<svg viewBox="0 0 24 24" fill="COLOR"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>`,
  // 爱心
  `<svg viewBox="0 0 24 24" fill="COLOR"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
]

function randomShape(color: string) {
  const svg = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  return svg.replace(/COLOR/g, color)
}

function spawnShape(x: number, y: number, color: string, burst = false) {
  const el = document.createElement('div')
  const size = 10 + Math.random() * 10
  const angle = Math.random() * Math.PI * 2
  const distance = burst ? 25 + Math.random() * 45 : 6 + Math.random() * 10
  const dx = Math.cos(angle) * distance
  const dy = burst ? Math.sin(angle) * distance - 20 : Math.sin(angle) * distance + 12
  const duration = burst ? 700 + Math.random() * 500 : 900 + Math.random() * 700
  const rotation = Math.random() * 360

  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.8;
    transition: none;
  `
  el.innerHTML = randomShape(color)
  document.body.appendChild(el)

  const startTime = performance.now()
  const animate = (now: number) => {
    const t = (now - startTime) / duration
    if (t >= 1) {
      el.remove()
      return
    }
    const ease = 1 - Math.pow(1 - t, 3)
    el.style.transform = `translate(${dx * ease}px, ${dy * ease}px) rotate(${rotation + t * 200}deg) scale(${1 - t * 0.4})`
    el.style.opacity = String(0.8 * (1 - t))
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

export const SakuraCursor: React.FC = () => {
  const lastPos = useRef({ x: 0, y: 0 })
  const throttleRef = useRef(0)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - throttleRef.current < 60) return
      throttleRef.current = now

      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)
      if (speed < 3) return

      const color = PINK_COLORS[Math.floor(Math.random() * PINK_COLORS.length)]
      spawnShape(e.clientX, e.clientY, color)
      lastPos.current = { x: e.clientX, y: e.clientY }
    }

    const onClick = (e: MouseEvent) => {
      const count = 5 + Math.floor(Math.random() * 4)
      for (let i = 0; i < count; i++) {
        const color = PINK_COLORS[Math.floor(Math.random() * PINK_COLORS.length)]
        spawnShape(e.clientX, e.clientY, color, true)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
