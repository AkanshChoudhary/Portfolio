import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { PhoneHero } from './phone3d'
import { site } from '../data/site'
import type { NavigateKey } from '../data/site'

type Props = {
  onNavigate: (key: NavigateKey) => void
}

function useIsPhoneViewport() {
  const [isPhone, setIsPhone] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)')
    const update = () => setIsPhone(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isPhone
}

export function HeroSection({ onNavigate }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const isPhone = useIsPhoneViewport()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={sectionRef} className="hero" id="top">
      <div className="hero__shell">
        <motion.div className="hero__copy" style={isPhone ? undefined : { y: textY, opacity: fade }}>
          <p className="hero__eyebrow">
            <span className="hero__pulse" />
            {site.hero.eyebrow}
          </p>
          <h1 className="hero__title">
            {site.hero.introPrefix} {site.profile.name.split(' ')[0]}.
            <br />
            {site.hero.headlineBeforeAccent}{' '}
            <span className="hero__title-accent">{site.hero.headlineAccent}</span>{' '}
            {site.hero.headlineAfterAccent}
          </h1>
          <p className="hero__location">
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s7-6.16 7-12a7 7 0 1 0-14 0c0 5.84 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="2.5" fill="currentColor" />
            </svg>
            {site.profile.location}
          </p>
          <dl className="hero__metrics">
            {site.hero.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          className="hero__canvas-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero__phone-stage" aria-label="Interactive Galaxy-style portfolio phone">
            <PhoneHero
              github={site.links.github}
              linkedin={site.links.linkedin}
              resume={site.links.resume}
              labels={site.phone.apps}
              onNavigate={onNavigate}
            />
          </div>
          <p className="hero__canvas-hint">
            <span>{site.hero.phoneHint.line1}</span>
            <span>{site.hero.phoneHint.line2}</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
