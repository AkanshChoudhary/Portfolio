import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { site } from '../../data/site'
import { PhoneScreen, buildRoundedScreenGeometry } from './PhoneScreen'
import { createPhoneScreenTexture } from './ScreenTexture'
import {
  createBackGlassMaterial,
  createButtonMaterial,
  createFrameMaterial,
  createLensCoatingGlintMaterial,
  createLensGlassMaterial,
  createLensIRWindowMaterial,
  createLensIrisBackingMaterial,
  createLensPupilMaterial,
  createLensRingMaterial,
  createScreenGlassMaterial,
} from './PhoneMaterials'
import type { PhoneIcon } from './types'

/**
 * Realistic Galaxy S25–class proportions (world units). The phone is
 * designed as a single unified body with thin canvas-textured planes for
 * the screen and back glass — no stacked slabs, no double silhouettes.
 */
export const PHONE = {
  width: 1.55,
  height: 3.2,
  depth: 0.16,
  cornerRadius: 0.22,
  /** Width/height of the chamfer that softens front-to-side and back-to-side edges. */
  bevel: 0.012,
  /** Margin between the body edge and the visible screen / back-glass area (narrower = thinner bezels, modern slabs). */
  screenInset: 0.048,
  /** Tiny lift so the screen plane never z-fights with the body's front face. */
  surfaceOffset: 0.0008,
} as const

const SCREEN_W = PHONE.width - PHONE.screenInset * 2
const SCREEN_H = PHONE.height - PHONE.screenInset * 2
/** Inner bezel corner — offset from body radius by full inset so the curved screen edge meets the frame without wedge gaps */
const SCREEN_RADIUS = Math.max(PHONE.cornerRadius - PHONE.screenInset, 0.05)

/**
 * Builds the phone body as an extruded rounded-rectangle so the rounded
 * X/Y corners are independent of the body's depth (drei's RoundedBox
 * silently clamps `radius` to `min(w,h,d)/2`, which gives weird hollow
 * edges on a thin slab like a phone).
 *
 * The bevel adds a thin chamfer where the side meets the front and back
 * glass — the same shape modern Galaxy/iPhone frames use.
 */
function buildPhoneBodyGeometry(
  width: number,
  height: number,
  depth: number,
  cornerRadius: number,
  bevel: number,
): THREE.ExtrudeGeometry {
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

  const safeBevel = Math.max(0.0001, Math.min(bevel, depth / 2 - 0.001))
  const geometry = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: depth - safeBevel * 2,
    bevelEnabled: true,
    bevelThickness: safeBevel,
    bevelSize: safeBevel,
    bevelOffset: 0,
    bevelSegments: 6,
    curveSegments: 32,
  })

  geometry.computeBoundingBox()
  if (geometry.boundingBox) {
    const center = geometry.boundingBox.getCenter(new THREE.Vector3())
    geometry.translate(-center.x, -center.y, -center.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Warm amber LED — radial gradient with subtle off-centre hotspot (canvas → texture map). */
function createFlashGradientTexture(): THREE.CanvasTexture {
  const s = 256
  const canvas = document.createElement('canvas')
  canvas.width = s
  canvas.height = s
  const ctx = canvas.getContext('2d')!
  const cx = s / 2
  const cy = s / 2
  const r = cx * 0.98

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)

  /** Slightly off-centre radial + faint warm vignette reads like a real duel-LED diffuser */
  const g = ctx.createRadialGradient(cx * 0.78, cy * 0.76, r * 0.05, cx, cy, r)
  g.addColorStop(0, '#fffbeb')
  g.addColorStop(0.08, '#fff3d9')
  g.addColorStop(0.22, '#ffe9a8')
  g.addColorStop(0.45, '#ffd44d')
  g.addColorStop(0.68, '#eab308')
  g.addColorStop(0.86, '#ca8c16')
  g.addColorStop(0.96, '#a16207')
  g.addColorStop(1, '#854d0e')

  ctx.fillStyle = g
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/** Irregular radial falloff + faint rings to read as depth behind cover glass. */
function createLensIrisTexture(): THREE.CanvasTexture {
  const s = 256
  const canvas = document.createElement('canvas')
  canvas.width = s
  canvas.height = s
  const ctx = canvas.getContext('2d')!
  const c = s / 2
  const r = c * 0.98
  ctx.beginPath()
  ctx.arc(c, c, r, 0, Math.PI * 2)
  const g = ctx.createRadialGradient(c * 0.58, c * 0.52, r * 0.04, c, c, r)
  g.addColorStop(0, '#010203')
  g.addColorStop(0.18, '#080b12')
  g.addColorStop(0.42, '#121a2a')
  g.addColorStop(0.65, '#1c283c')
  g.addColorStop(0.88, '#24324a')
  g.addColorStop(1, '#2a3d58')
  ctx.fillStyle = g
  ctx.fill()

  ctx.strokeStyle = 'rgba(90, 110, 150, 0.18)'
  ctx.lineWidth = 1.2
  for (const frac of [0.36, 0.58, 0.74]) {
    ctx.beginPath()
    ctx.arc(c, c, r * frac, 0, Math.PI * 2)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

interface PhoneModelProps {
  icons: PhoneIcon[]
  statusTime: string
}

export function PhoneModel({ icons, statusTime }: PhoneModelProps) {
  // Materials — instantiated once and disposed on unmount.
  const frameMat = useMemo(createFrameMaterial, [])
  const backMat = useMemo(createBackGlassMaterial, [])
  const glassMat = useMemo(createScreenGlassMaterial, [])
  const buttonMat = useMemo(createButtonMaterial, [])
  const ringMat = useMemo(createLensRingMaterial, [])
  const lensGlassMat = useMemo(createLensGlassMaterial, [])
  const lensPupilMat = useMemo(createLensPupilMaterial, [])
  const lensGlintMat = useMemo(createLensCoatingGlintMaterial, [])

  // Screen canvas-texture
  const screen = useMemo(
    () => createPhoneScreenTexture(icons, {
      networkLabel: site.phone.networkLabel,
      searchPlaceholder: site.phone.searchPlaceholder,
      statusTime,
      weather: site.phone.weather,
    }),
    [icons, statusTime],
  )

  // Custom phone body geometry (extruded rounded-rect with chamfered edges).
  const bodyGeometry = useMemo(
    () =>
      buildPhoneBodyGeometry(
        PHONE.width,
        PHONE.height,
        PHONE.depth,
        PHONE.cornerRadius,
        PHONE.bevel,
      ),
    [],
  )

  /** Must match PhoneScreen rounded outline — a full rectangle would paint glass into the bezel corners (grey wedges). */
  const screenGlassGeometry = useMemo(
    () => buildRoundedScreenGeometry(SCREEN_W, SCREEN_H, SCREEN_RADIUS, 32),
    [],
  )

  const flashGradientMap = useMemo(() => createFlashGradientTexture(), [])
  const lensIrisMap = useMemo(() => createLensIrisTexture(), [])
  const lensIRMat = useMemo(createLensIRWindowMaterial, [])
  const lensIrisBackingMat = useMemo(
    () => createLensIrisBackingMaterial(lensIrisMap),
    [lensIrisMap],
  )

  useEffect(() => {
    return () => {
      screen.dispose()
      bodyGeometry.dispose()
      screenGlassGeometry.dispose()
      flashGradientMap.dispose()
      lensIrisMap.dispose()
      lensIRMat.dispose()
      lensIrisBackingMat.dispose()
      frameMat.dispose()
      backMat.dispose()
      glassMat.dispose()
      buttonMat.dispose()
      ringMat.dispose()
      lensGlassMat.dispose()
      lensPupilMat.dispose()
      lensGlintMat.dispose()
    }
  }, [
    screen,
    bodyGeometry,
    screenGlassGeometry,
    flashGradientMap,
    lensIrisMap,
    lensIRMat,
    lensIrisBackingMat,
    frameMat,
    backMat,
    glassMat,
    buttonMat,
    ringMat,
    lensGlassMat,
    lensPupilMat,
    lensGlintMat,
  ])

  const frontZ = PHONE.depth / 2
  const backZ = -PHONE.depth / 2
  const backGlassZ = backZ - PHONE.surfaceOffset

  // Camera bump is composed of three lens modules slightly above the back.
  const cameraColumnX = -PHONE.width / 2 + 0.34
  const cameraTopY = PHONE.height / 2 - 0.3
  const cameraSpacing = 0.3
  const lensProtrude = 0.025
  const lensSize = 0.13

  return (
    <group>
      {/* 1. Solid body: extruded rounded-rect with chamfered front/back edges. */}
      <mesh geometry={bodyGeometry}>
        <primitive object={frameMat} attach="material" />
      </mesh>

      {/* 2. Front: screen texture + transparent glass overlay. */}
      <PhoneScreen
        width={SCREEN_W}
        height={SCREEN_H}
        cornerRadius={SCREEN_RADIUS}
        z={frontZ + PHONE.surfaceOffset}
        screen={screen}
        icons={icons}
      />
      <mesh
        geometry={screenGlassGeometry}
        position={[0, 0, frontZ + PHONE.surfaceOffset + 0.0008]}
        renderOrder={2}
      >
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* 3. Punch-hole front camera (centered along the top of the screen). */}
      <PunchHoleCamera frontZ={frontZ + PHONE.surfaceOffset + 0.002} />

      {/* 4. Back glass plate — same outline as screen, mirrored to the rear. */}
      <BackPlate z={backGlassZ} material={backMat} />

      {/* 5. Rear camera system — three lenses + flash + mic. */}
      <RearCameras
        x={cameraColumnX}
        topY={cameraTopY}
        spacing={cameraSpacing}
        size={lensSize}
        lensZ={backGlassZ - lensProtrude / 2}
        backGlassZ={backGlassZ}
        flashGradientMap={flashGradientMap}
        ringMat={ringMat}
        glassMat={lensGlassMat}
        pupilMat={lensPupilMat}
        glintMat={lensGlintMat}
        irMat={lensIRMat}
        irisBackingMat={lensIrisBackingMat}
      />

      {/* 6. Side hardware buttons. */}
      <SideButtons material={buttonMat} />

      {/* 7. Bottom features — USB-C and speaker grille. */}
      <BottomEdge buttonMat={buttonMat} />
    </group>
  )
}

/* ----- Sub-components ------------------------------------------------- */

function BackPlate({ z, material }: { z: number; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const r = SCREEN_RADIUS
    const w = SCREEN_W
    const h = SCREEN_H
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
    return new THREE.ShapeGeometry(shape, 16)
  }, [])

  return (
    <mesh geometry={geometry} position={[0, 0, z]} rotation={[0, Math.PI, 0]}>
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function PunchHoleCamera({ frontZ }: { frontZ: number }) {
  return (
    <group position={[0, SCREEN_H / 2 - 0.16, frontZ]}>
      <mesh>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color="#02030a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.0008]}>
        <ringGeometry args={[0.045, 0.05, 32]} />
        <meshStandardMaterial color="#1f2229" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[-0.012, -0.012, 0.0014]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color="#3a4458" transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

function RearCameras({
  x,
  topY,
  spacing,
  size,
  lensZ,
  backGlassZ,
  flashGradientMap,
  ringMat,
  glassMat,
  pupilMat,
  glintMat,
  irMat,
  irisBackingMat,
}: {
  x: number
  topY: number
  spacing: number
  size: number
  /** Lens barrel center depth (into the bump). */
  lensZ: number
  /** Rear glass plane — flash/mic sit slightly outside (-Z) so they read on the exterior. */
  backGlassZ: number
  flashGradientMap: THREE.CanvasTexture
  ringMat: THREE.Material
  glassMat: THREE.Material
  pupilMat: THREE.Material
  glintMat: THREE.Material
  irMat: THREE.Material
  irisBackingMat: THREE.Material
}) {
  const lenses = [topY, topY - spacing, topY - 2 * spacing]
  const barrelH = 0.052
  const flashX = x + 0.33
  const flashY = topY - spacing * 0.52
  /**
   * Disks default to normal +Z; the rear glass uses Y-flip so the outer side faces -Z.
   * Place the flash slightly outside the back plane (-Z) so it reads on the exterior.
   */
  const flashOut = 0.02
  const flashZ = backGlassZ - flashOut
  const micZ = backGlassZ - 0.014

  return (
    <group>
      {lenses.map((y) => (
        <group key={y} position={[x, y, lensZ]}>
          {/* Metal barrel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size, size * 1.04, barrelH, 64]} />
            <primitive object={ringMat} attach="material" />
          </mesh>
          {/* Convex cover glass (no extra ring here — a flat ring at the rim z-fights the dome) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -barrelH * 0.45]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[size * 0.9, 48, 40]} />
            <primitive object={glassMat} attach="material" />
          </mesh>
          {/* Coating streak / glint */}
          <mesh position={[size * 0.2, size * 0.16, -0.03]} rotation={[0, 0, -0.65]}>
            <circleGeometry args={[size * 0.11, 20]} />
            <primitive object={glintMat} attach="material" />
          </mesh>
          {/* IR / laser AF window */}
          <mesh position={[size * 0.2, size * 0.2, -0.034]}>
            <circleGeometry args={[size * 0.15, 32]} />
            <primitive object={irMat} attach="material" />
          </mesh>
          {/* Sensor stack — textured iris cavity */}
          <mesh position={[0, 0, -0.038]}>
            <circleGeometry args={[size * 0.48, 40]} />
            <primitive object={irisBackingMat} attach="material" />
          </mesh>
          <mesh position={[0, 0, -0.041]}>
            <circleGeometry args={[size * 0.3, 32]} />
            <primitive object={pupilMat} attach="material" />
          </mesh>
        </group>
      ))}
      {/* LED flash — yellow–amber radial gradient map, facing out from the back */}
      <mesh
        position={[flashX, flashY, flashZ + 0.001]}
        rotation={[0, Math.PI, 0]}
        renderOrder={8}
      >
        <circleGeometry args={[0.036, 56]} />
        <meshBasicMaterial
          map={flashGradientMap}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Mic hole */}
      <mesh position={[x + 0.34, topY + spacing * 0.12, micZ]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.015, 16]} />
        <meshBasicMaterial color="#06070a" toneMapped={false} />
      </mesh>
    </group>
  )
}

function SideButtons({ material }: { material: THREE.Material }) {
  /** Volume pair on viewer's right (+X); power on opposite edge, upper-mid typical of thin phones. */
  const rightEdgeX = PHONE.width / 2 + 0.018
  const leftEdgeX = -PHONE.width / 2 - 0.018
  /** Shorter mid-section than power key — typical volume-rocker silhouette */
  const volKey: [number, number, number, number] = [0.014, 0.27, 4, 10]
  const powerKey: [number, number, number, number] = [0.015, 0.44, 4, 10]
  return (
    <>
      <mesh position={[rightEdgeX, 0.86, 0]} name="side-volume-up">
        <capsuleGeometry args={volKey} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[rightEdgeX, 0.54, 0]} name="side-volume-down">
        <capsuleGeometry args={volKey} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[leftEdgeX, 0.72, 0]} name="side-power">
        <capsuleGeometry args={powerKey} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}

function BottomEdge({ buttonMat }: { buttonMat: THREE.Material }) {
  const yPos = -PHONE.height / 2 + 0.025
  return (
    <group position={[0, yPos, 0]}>
      <mesh>
        <boxGeometry args={[0.14, 0.024, 0.05]} />
        <meshStandardMaterial color="#06070a" metalness={0.5} roughness={0.7} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={`spk-${i}`}
          position={[0.26 + i * 0.04, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.024, 16]} />
          <primitive object={buttonMat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}
