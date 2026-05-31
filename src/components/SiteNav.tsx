import { motion } from 'framer-motion'
import { site } from '../data/site'
import type { NavigateKey } from '../data/site'

type Props = {
  onNavigate: (key: NavigateKey) => void
}

export function SiteNav({ onNavigate }: Props) {
  return (
    <motion.header
      className="site-nav"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="site-nav__inner">
        <nav className="site-nav__links" aria-label="Primary">
          {site.navigation.map((l) => (
            <button key={l.id} type="button" onClick={() => onNavigate(l.id)}>
              {l.label}
            </button>
          ))}
          <a className="site-nav__resume" href={site.links.resume} target="_blank" rel="noopener noreferrer">
            {site.phone.apps.resume}
          </a>
        </nav>
      </div>
    </motion.header>
  )
}
