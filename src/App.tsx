import { useCallback } from 'react'
import { ParallaxBackdrop } from './components/ParallaxBackdrop'
import { SiteNav } from './components/SiteNav'
import { HeroSection } from './components/HeroSection'
import {
  AboutSection,
  ProjectsSection,
  ExperienceSection,
  PublicationSection,
  ContactSection,
  Footer,
} from './components/ContentSections'
import type { NavigateKey } from './data/site'

const sectionIds: NavigateKey[] = ['about', 'projects', 'experience', 'contact']

function scrollToSection(key: NavigateKey): void {
  if (!sectionIds.includes(key)) return
  document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function App() {
  const onNavigate = useCallback((key: NavigateKey) => {
    scrollToSection(key)
  }, [])

  return (
    <div className="app">
      <ParallaxBackdrop />
      <SiteNav onNavigate={onNavigate} />
      <main>
        <HeroSection onNavigate={onNavigate} />
        <AboutSection />
        <ProjectsSection />
        <ExperienceSection />
        <PublicationSection />
        <ContactSection />
      </main>
      <Footer />
      <a className="skip-link" href="#about">
        Skip to content
      </a>
    </div>
  )
}
