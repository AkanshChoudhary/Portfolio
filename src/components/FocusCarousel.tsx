import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, animate, useMotionValue, useSpring } from 'framer-motion'

type Props = {
  items: React.ReactNode[]
  itemWidth?: number
  gap?: number
  focusScale?: number
  className?: string
}

export function FocusCarousel({
  items,
  itemWidth = 320,
  gap = 28,
  focusScale = 1.04,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)
  const count = items.length
  const isNarrow = containerWidth > 0 && containerWidth < 720
  const effectiveItemWidth = containerWidth > 0 && containerWidth < itemWidth + 80
    ? Math.max(260, containerWidth - 96)
    : itemWidth
  const effectiveGap = isNarrow ? Math.min(gap, 20) : gap
  const cellWidth = effectiveItemWidth + effectiveGap

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 140, damping: 30, mass: 1 })

  const getStartOffset = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 800
    const shellMaxWidth = 1320
    const shellPadding = Math.max(24, Math.min(containerWidth * 0.05, 60))
    if (containerWidth > shellMaxWidth) {
      return (containerWidth - shellMaxWidth) / 2 + shellPadding
    }
    return shellPadding
  }, [])

  const scrollToIdx = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(count - 1, idx))
      setActiveIdx(clamped)
      const startOffset = getStartOffset()
      animate(x, isNarrow ? startOffset : -(clamped * cellWidth) + startOffset, {
        type: 'spring', stiffness: 140, damping: 30, mass: 1,
      })
    },
    [count, cellWidth, getStartOffset, isNarrow, x],
  )

  const goLeft = useCallback(() => scrollToIdx(activeIdx - 1), [activeIdx, scrollToIdx])
  const goRight = useCallback(() => scrollToIdx(activeIdx + 1), [activeIdx, scrollToIdx])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const updateWidth = () => setContainerWidth(node.clientWidth)

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const startOffset = getStartOffset()
    x.set(isNarrow ? startOffset : -(activeIdx * cellWidth) + startOffset)
  }, [activeIdx, cellWidth, getStartOffset, isNarrow, x])

  const canGoLeft = activeIdx > 0
  const canGoRight = activeIdx < count - 1

  return (
    <div className={`focus-carousel ${className}`} ref={containerRef}>
      {canGoLeft && (
        <button
          type="button"
          className="focus-carousel__arrow focus-carousel__arrow--left"
          onClick={goLeft}
          aria-label="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      {canGoRight && (
        <button
          type="button"
          className="focus-carousel__arrow focus-carousel__arrow--right"
          onClick={goRight}
          aria-label="Next"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <div className="focus-carousel__viewport">
        <motion.div className="focus-carousel__track" style={{ x: springX, gap: effectiveGap }}>
          {items.map((node, idx) => {
            if (isNarrow && idx !== activeIdx) return null
            const isFocused = idx === activeIdx
            return (
              <motion.div
                key={idx}
                className={`focus-carousel__item ${isFocused ? 'focus-carousel__item--active' : ''}`}
                style={{ width: effectiveItemWidth, flexShrink: 0 }}
                animate={{
                  scale: isFocused ? focusScale : 0.92,
                  opacity: isFocused ? 1 : 0.4,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              >
                {node}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
