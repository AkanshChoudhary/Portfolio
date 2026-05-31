import { motion, useScroll, useTransform } from 'framer-motion'

/** Layered gradients and drifting orbs tied to page scroll */
export function ParallaxBackdrop() {
  const { scrollYProgress } = useScroll()

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  return (
    <div className="parallax-backdrop" aria-hidden>
      <motion.div className="parallax-backdrop__mesh" style={{ scale }} />
      <motion.div className="parallax-backdrop__orb parallax-backdrop__orb--a" style={{ y: y1 }} />
      <motion.div className="parallax-backdrop__orb parallax-backdrop__orb--b" style={{ y: y2 }} />
      <div className="parallax-backdrop__grid" />
    </div>
  )
}
