import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import { PhoneModel } from './PhoneModel'
import { buildPhoneIcons } from './phoneIcons'
import type { NavigateKey } from '../../data/site'
import type { PhoneAppLabels, PhoneIcon } from './types'

export interface PhoneHeroProps {
  github: string
  linkedin: string
  resume: string
  labels: PhoneAppLabels
  onNavigate: (key: NavigateKey) => void
}

/**
 * Renders the phone inside a tilting/floating rig and drives the very
 * subtle pointer-parallax + idle float so the device feels alive without
 * fighting OrbitControls.
 */
function formatPhoneTime(date: Date): string {
  const hours = date.getHours()
  const displayHour = hours % 12 || 12
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${displayHour}:${minutes}`
}

function PhoneRig({
  icons,
  statusTime,
}: {
  icons: PhoneIcon[]
  statusTime: string
}) {
  const group = useRef<Group>(null)
  const { pointer } = useThree()

  useFrame((state) => {
    const node = group.current
    if (!node) return
    const targetTiltX = pointer.y * 0.08
    const targetTiltY = pointer.x * 0.16
    node.rotation.x += (targetTiltX - node.rotation.x) * 0.05
    node.rotation.y += (targetTiltY - node.rotation.y) * 0.05
    node.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.05
  })

  return (
    <group ref={group}>
      <PhoneModel icons={icons} statusTime={statusTime} />
    </group>
  )
}

export function PhoneHero(props: PhoneHeroProps) {
  const [statusTime, setStatusTime] = useState(() => formatPhoneTime(new Date()))

  useEffect(() => {
    let intervalId: number | undefined
    const updateTime = () => setStatusTime(formatPhoneTime(new Date()))
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 100

    const timeoutId = window.setTimeout(() => {
      updateTime()
      intervalId = window.setInterval(updateTime, 60_000)
    }, msUntilNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  const icons = useMemo(
    () =>
      buildPhoneIcons({
        github: props.github,
        linkedin: props.linkedin,
        labels: props.labels,
        resume: props.resume,
        onNavigate: props.onNavigate,
      }),
    [props.github, props.labels, props.linkedin, props.resume, props.onNavigate],
  )

  return (
    <>
      {/* WebGL screen-reader fallback (always present, visually hidden). */}
      <nav className="sr-only" aria-label="Portfolio navigation">
        <ul>
          {icons.map((icon) => (
            <li key={icon.id}>
              {icon.href ? (
                <a href={icon.href} target="_blank" rel="noopener noreferrer">
                  {icon.label}
                </a>
              ) : (
                <button type="button" onClick={icon.onClick}>
                  {icon.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <Canvas
        className="phone-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          background: 'transparent',
        }}
        gl={{
          alpha: true,
          antialias: true,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        shadows={false}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMappingExposure = 1.05
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.18, 8.4]} fov={24} near={0.1} far={60} />

        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 8, 5]} intensity={1.0} />
        <directionalLight position={[-5, -3, -2]} intensity={0.3} color="#8b93ff" />
        <pointLight position={[0, 2, 4]} intensity={0.4} color="#22d3ee" />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.85} />
          <PhoneRig icons={icons} statusTime={statusTime} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2 - 0.18}
          maxPolarAngle={Math.PI / 2 + 0.18}
          rotateSpeed={0.7}
          enableDamping
          dampingFactor={0.08}
        />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.12} luminanceThreshold={0.92} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.28} />
        </EffectComposer>
      </Canvas>
    </>
  )
}
