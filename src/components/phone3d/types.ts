import type { CanvasTexture } from 'three'

export type IconKey =
  | 'folder'
  | 'briefcase'
  | 'user'
  | 'mail'
  | 'file'
  | 'github'
  | 'linkedin'

export interface PhoneIcon {
  id: string
  label: string
  icon: IconKey
  color: string
  href?: string
  onClick?: () => void
}

export type PhoneAppLabels = Record<'resume' | 'github' | 'linkedin' | 'projects' | 'work' | 'about' | 'contact', string>

export interface PhoneWeather {
  temperature: string
  condition: string
  location: string
}

export interface ScreenHitbox {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export interface PhoneScreenTexture {
  texture: CanvasTexture
  hitboxes: ScreenHitbox[]
  width: number
  height: number
  dispose: () => void
}
