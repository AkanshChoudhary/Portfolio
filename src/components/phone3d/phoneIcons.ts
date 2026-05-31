import type { PhoneAppLabels, PhoneIcon } from './types'
import type { NavigateKey } from '../../data/site'

export interface BuildIconsOptions {
  github: string
  linkedin: string
  resume: string
  labels: PhoneAppLabels
  onNavigate: (key: NavigateKey) => void
}

export function buildPhoneIcons(opts: BuildIconsOptions): PhoneIcon[] {
  return [
    {
      id: 'resume',
      label: opts.labels.resume,
      icon: 'file',
      color: '#3ddc84',
      href: opts.resume,
    },
    {
      id: 'github',
      label: opts.labels.github,
      icon: 'github',
      color: '#475569',
      href: opts.github,
    },
    {
      id: 'linkedin',
      label: opts.labels.linkedin,
      icon: 'linkedin',
      color: '#0a66c2',
      href: opts.linkedin,
    },
    {
      id: 'projects',
      label: opts.labels.projects,
      icon: 'folder',
      color: '#5b72ff',
      onClick: () => opts.onNavigate('projects'),
    },
    {
      id: 'work',
      label: opts.labels.work,
      icon: 'briefcase',
      color: '#f59e16',
      onClick: () => opts.onNavigate('experience'),
    },
    {
      id: 'about',
      label: opts.labels.about,
      icon: 'user',
      color: '#8b5cf6',
      onClick: () => opts.onNavigate('about'),
    },
    {
      id: 'contact',
      label: opts.labels.contact,
      icon: 'mail',
      color: '#2dd4bf',
      onClick: () => opts.onNavigate('contact'),
    },
  ]
}
