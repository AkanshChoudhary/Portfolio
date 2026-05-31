import siteContent from './site.json'

export type Project = {
  id: string
  name: string
  description: string
  stack: string
  link: string
  accent: string
}

export type Job = {
  company: string
  role: string
  location?: string
  period: string
  bullets: string[]
}

export type Education = {
  school: string
  degree: string
  location?: string
  graduation: string
  detail?: string
}

export type NavLink = {
  id: NavigateKey
  label: string
}

export type NavigateKey =
  | 'projects'
  | 'experience'
  | 'contact'
  | 'about'
  | 'github'
  | 'linkedin'
  | 'play'

export type SiteContent = {
  profile: {
    name: string
    navSuffix: string
    title: string
    email: string
    phoneDisplay: string
    location: string
  }
  links: {
    github: string
    linkedin: string
    resume: string
    playStore: string
  }
  navigation: NavLink[]
  hero: {
    eyebrow: string
    introPrefix: string
    headlineBeforeAccent: string
    headlineAccent: string
    headlineAfterAccent: string
    metrics: { label: string; value: string }[]
    phoneHint: {
      line1: string
      line2: string
    }
  }
  about: {
    heading: string
    body: string
    skillsHeading: string
    educationHeading: string
  }
  skills: string[]
  education: Education[]
  projectsSection: {
    heading: string
    linkLabel: string
  }
  projects: Project[]
  experienceSection: {
    heading: string
  }
  experience: Job[]
  publications: {
    heading: string
    items: {
      title: string
      venue: string
      doi: string
      linkLabel: string
    }[]
  }
  contact: {
    heading: string
    body: string
    emailButtonPrefix: string
    linkedinLabel: string
    githubLabel: string
  }
  footer: {
    suffix: string
    backToTopLabel: string
  }
  phone: {
    weather: {
      temperature: string
      condition: string
      location: string
    }
    apps: Record<'resume' | 'github' | 'linkedin' | 'projects' | 'work' | 'about' | 'contact', string>
    searchPlaceholder: string
    networkLabel: string
  }
}

export const site = siteContent as SiteContent
