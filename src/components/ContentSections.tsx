import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import type { RefObject } from 'react'
import { useRef } from 'react'
import { site } from '../data/site'
import { FocusCarousel } from './FocusCarousel'

const icons: Record<string, string> = {
  'Carnegie Mellon University': '/icons/cmu.png',
  'Vellore Institute of Technology': '/icons/vit.png',
  Adobe: '/icons/adobe.png',
  Amdocs: '/icons/amdocs.png',
  GreedyGame: '/icons/greedygame.png',
  canvasx: '/icons/canvasx.png',
  dividr: '/icons/dividr.png',
  habitpro: '/icons/habitpro.png',
}

function ParallaxSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement | null>,
    offset: ['start end', 'end start'],
  })
  const yBg = useTransform(scrollYProgress, [0, 1], [-32, 32])
  return (
    <section ref={ref} className={`content-section ${className}`} id={id}>
      <motion.div className="content-section__parallax-bg" aria-hidden style={{ y: yBg }} />
      {children}
    </section>
  )
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number | string) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: (typeof i === 'number' ? i : Number(i ?? 0)) * 0.06,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
}

function renderBoldText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export function AboutSection() {
  return (
    <ParallaxSection id="about" className="content-section--about">
      <div className="shell content-section__inner">
        <motion.div
          className="section-header"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          custom={0}
        >
          <h2 className="section-title">{site.about.heading}</h2>
        </motion.div>

        <motion.p
          className="lede"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={1}
        >
          {renderBoldText(site.about.body)}
        </motion.p>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={2}
        >
          <h3 className="subsection-title subsection-title--major">{site.about.skillsHeading}</h3>
          <div className="skill-chips">
            {site.skills.map((s) => (
              <span key={s} className="skill-chip">{s}</span>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={3}
        >
          <h3 className="subsection-title subsection-title--major">{site.about.educationHeading}</h3>
          <div className="education-grid">
            {site.education.map((e) => (
              <div key={e.school} className="edu-card">
                {icons[e.school] && (
                  <img className="edu-card__icon" src={icons[e.school]} alt={e.school} />
                )}
                <strong className="edu-card__school">{e.school}</strong>
                <span className="edu-card__degree">{e.degree}</span>
                <span className="edu-card__meta">
                  {[e.graduation, e.location].filter(Boolean).join(' \u00b7 ')}
                </span>
                {e.detail && <span className="edu-card__detail">{e.detail}</span>}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </ParallaxSection>
  )
}

export function ProjectsSection() {
  const projectItems = site.projects.map((p) => (
    <div
      key={p.id}
      className="carousel-project-card"
      style={{ '--accent': p.accent } as React.CSSProperties}
    >
      <div className="carousel-project-card__body">
        {icons[p.id] && (
          <img className="carousel-card__icon" src={icons[p.id]} alt={p.name} />
        )}
        <h3>{p.name}</h3>
        <p>{p.description}</p>
        <p className="carousel-project-card__stack">{p.stack}</p>
        <a className="carousel-project-card__link" href={p.link} target="_blank" rel="noopener noreferrer">
          {site.projectsSection.linkLabel}
        </a>
      </div>
    </div>
  ))

  return (
    <ParallaxSection id="projects" className="content-section--alt content-section--projects">
      <div className="shell content-section__inner">
        <motion.div
          className="section-header"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          custom={0}
        >
          <h2 className="section-title">{site.projectsSection.heading}</h2>
        </motion.div>
      </div>
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        custom={1}
      >
        <FocusCarousel
          items={projectItems}
          itemWidth={440}
          gap={32}
          focusScale={1.03}
          className="carousel--projects"
        />
      </motion.div>
    </ParallaxSection>
  )
}

export function ExperienceSection() {
  const experienceItems = site.experience.map((job, i) => (
    <div key={`${job.company}-${i}`} className="carousel-exp-card">
      {icons[job.company] && (
        <img className="carousel-card__icon" src={icons[job.company]} alt={job.company} />
      )}
      <header>
        <h3>{job.role}</h3>
        <span className="carousel-exp-card__company">{job.company}</span>
        {job.location ? <span className="carousel-exp-card__loc">{job.location}</span> : null}
        <span className="carousel-exp-card__period">{job.period}</span>
      </header>
      <ul className="carousel-exp-card__bullets">
        {job.bullets.map((b) => (
          <li key={b.slice(0, 48)}>{b}</li>
        ))}
      </ul>
    </div>
  ))

  return (
    <ParallaxSection id="experience" className="content-section--experience">
      <div className="shell content-section__inner">
        <motion.div
          className="section-header"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          custom={0}
        >
          <h2 className="section-title">{site.experienceSection.heading}</h2>
        </motion.div>
      </div>
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        custom={1}
      >
        <FocusCarousel
          items={experienceItems}
          itemWidth={480}
          gap={32}
          focusScale={1.03}
          className="carousel--experience"
        />
      </motion.div>
    </ParallaxSection>
  )
}

export function PublicationSection() {
  return (
    <ParallaxSection id="publication" className="content-section--alt content-section--publication">
      <div className="shell content-section__inner">
        <motion.div
          className="section-header"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          custom={0}
        >
          <h2 className="section-title">{site.publications.heading}</h2>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={1}
        >
          <div className="publication-list">
            {site.publications.items.map((publication) => (
              <div className="publication-card" key={`${publication.title}-${publication.venue}`}>
                <p className="publication-card__title">{publication.title}</p>
                <p className="publication-card__venue">{publication.venue}</p>
                <a className="publication-card__link" href={publication.doi} target="_blank" rel="noopener noreferrer">
                  {publication.linkLabel}
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </ParallaxSection>
  )
}

export function ContactSection() {
  return (
    <ParallaxSection id="contact" className="content-section--cta">
      <div className="shell content-section__inner content-section__inner--cta">
        <motion.div
          className="cta-block glass-card"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          custom={0}
        >
          <h2>{site.contact.heading}</h2>
          <p>{site.contact.body}</p>
          <div className="cta-actions">
            <a className="btn btn--primary" href={`mailto:${site.profile.email}`}>
              {site.profile.email}
            </a>
            <a className="btn btn--ghost" href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
              {site.contact.linkedinLabel}
            </a>
            <a className="btn btn--ghost" href={site.links.github} target="_blank" rel="noopener noreferrer">
              {site.contact.githubLabel}
            </a>
          </div>
        </motion.div>
      </div>
    </ParallaxSection>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <a href="#top">{site.footer.backToTopLabel}</a>
      </div>
    </footer>
  )
}
