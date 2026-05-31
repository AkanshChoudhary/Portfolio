import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { PhoneIcon, PhoneScreenTexture, ScreenHitbox } from './types'

/**
 * Rounded rectangle `ShapeGeometry` with UVs normalized to (0..1).
 * Shared by the screen texture plane and the glass overlay so corner
 * geometry matches and no square corners leak past the bezel.
 */
export function buildRoundedScreenGeometry(
  width: number,
  height: number,
  cornerRadius: number,
  curveSegments = 24,
): THREE.ShapeGeometry {
  const r = Math.min(cornerRadius, width / 2, height / 2)
  const w = width
  const h = height

  const shape = new THREE.Shape()
  shape.moveTo(-w / 2 + r, -h / 2)
  shape.lineTo(w / 2 - r, -h / 2)
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  shape.lineTo(w / 2, h / 2 - r)
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  shape.lineTo(-w / 2 + r, h / 2)
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  shape.lineTo(-w / 2, -h / 2 + r)
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)

  const geometry = new THREE.ShapeGeometry(shape, curveSegments)
  // Recompute UVs so the texture maps cleanly onto the rounded rect.
  const positions = geometry.attributes.position as THREE.BufferAttribute
  const uvs = new Float32Array(positions.count * 2)
  for (let i = 0; i < positions.count; i++) {
    const px = positions.getX(i)
    const py = positions.getY(i)
    uvs[i * 2 + 0] = (px + w / 2) / w
    uvs[i * 2 + 1] = (py + h / 2) / h
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  return geometry
}

interface PhoneScreenProps {
  width: number
  height: number
  cornerRadius: number
  /** World-space Z position for the screen plane. */
  z: number
  screen: PhoneScreenTexture
  icons: PhoneIcon[]
}

export function PhoneScreen({ width, height, cornerRadius, z, screen, icons }: PhoneScreenProps) {
  const geometry = useMemo(
    () => buildRoundedScreenGeometry(width, height, cornerRadius, 32),
    [width, height, cornerRadius],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const uv = event.uv
    if (!uv) return

    const px = uv.x * screen.width
    const py = (1 - uv.y) * screen.height

    const hit = screen.hitboxes.find(
      (b: ScreenHitbox) =>
        px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h,
    )
    if (!hit) return

    const app = icons.find((i) => i.id === hit.id)
    if (!app) return
    if (app.onClick) return app.onClick()
    if (app.href) window.open(app.href, '_blank', 'noopener,noreferrer')
  }

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'auto'
      }}
    >
      <meshBasicMaterial map={screen.texture} toneMapped={false} />
    </mesh>
  )
}
