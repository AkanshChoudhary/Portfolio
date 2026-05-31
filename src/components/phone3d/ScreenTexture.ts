import * as THREE from 'three'
import type { IconKey, PhoneIcon, PhoneScreenTexture, PhoneWeather, ScreenHitbox } from './types'

/**
 * Builds the photorealistic phone home-screen as a CanvasTexture so it sits
 * naturally on the 3D screen plane and rotates with the device. Each icon
 * exposes a hitbox so raycasting can resolve taps via UV coordinates.
 */

const ICON_PATHS: Record<IconKey, string> = {
  folder:
    'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  briefcase:
    'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  mail: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  file:
    'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z',
  github:
    'M12 1C5.925 1 1 5.923 1 12c0 4.867 3.246 8.985 7.734 10.446.564.097.77-.244.77-.547 0-.268-.009-1.156-.015-2.096-3.146.682-3.814-1.352-3.814-1.352-.516-1.314-1.26-1.664-1.26-1.664-1.03-.688.079-.673.079-.673 1.14.098 1.735 1.165 1.735 1.165 1.01 1.752 2.642 1.246 3.289.957.097-.743.394-1.247.716-1.534-2.483-.282-5.097-1.241-5.097-5.527 0-1.22.434-2.217 1.147-3.002-.115-.284-.497-1.424.11-2.966 0 0 .939-.297 3.069 1.147.89-.246 1.847-.369 2.794-.378.943.009 1.907.134 2.801.379 2.127-1.444 3.069-1.147 3.069-1.147.613 1.542.239 2.682.118 2.966.716.783 1.144 1.782 1.144 3.004 0 4.297-2.621 5.239-5.117 5.519.397.356.743 1.072.743 2.162 0 1.56-.016 2.816-.016 3.207 0 .305.207.659.783.547C17.759 21.986 21 17.866 21 12c0-6.077-4.922-11-11-11z',
  linkedin:
    'M20.447 20.452H16.83V14.89c0-1.328-.026-3.039-1.852-3.039-1.854 0-2.137 1.446-2.137 2.941v5.66H9.228V9h3.448v1.561h.046c.48-.9 1.637-1.85 3.374-1.85 3.606 0 4.268 2.371 4.268 5.457v6.284zM5.337 7.433a2.06 2.06 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.783 13.019H3.555V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
}

function pathRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  key: IconKey,
  cx: number,
  cy: number,
  size: number,
) {
  const path = new Path2D(ICON_PATHS[key])
  ctx.save()
  ctx.translate(cx - size / 2, cy - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.shadowColor = 'rgba(0,10,30,0.4)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetY = 2
  ctx.fillStyle = '#ffffff'
  ctx.fill(path)
  ctx.restore()
}

function drawAppTile(
  ctx: CanvasRenderingContext2D,
  app: PhoneIcon,
  x: number,
  y: number,
  size: number,
  labelGap: number,
  hits: ScreenHitbox[],
) {
  const cx = x + size / 2
  const cy = y + size / 2
  const tileR = Math.min(52, size / 4)

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 36
  ctx.shadowOffsetY = 16
  ctx.fillStyle = app.color
  pathRoundedRect(ctx, x, y, size, size, tileR)
  ctx.fill()
  ctx.restore()

  /* Gloss + depth: top-left highlight, bottom vignette */
  const gloss = ctx.createLinearGradient(x, y, x + size, y + size)
  gloss.addColorStop(0, 'rgba(255,255,255,0.28)')
  gloss.addColorStop(0.38, 'rgba(255,255,255,0.05)')
  gloss.addColorStop(0.65, 'rgba(0,0,0,0)')
  gloss.addColorStop(1, 'rgba(0,0,0,0.18)')
  ctx.fillStyle = gloss
  pathRoundedRect(ctx, x, y, size, size, tileR)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.38)'
  ctx.lineWidth = 3
  pathRoundedRect(ctx, x, y, size, size, tileR)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1
  pathRoundedRect(ctx, x + 1, y + 1, size - 2, size - 2, tileR - 1)
  ctx.stroke()

  drawGlyph(ctx, app.icon, cx, cy, 132)

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 54px "DM Sans", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(8,12,28,0.55)'
  ctx.shadowColor = 'transparent'
  ctx.fillText(app.label, cx + 1, y + size + labelGap + 21)
  ctx.fillStyle = '#f4f7ff'
  ctx.shadowColor = 'rgba(0,6,20,0.45)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 2
  ctx.fillText(app.label, cx, y + size + labelGap + 20)
  ctx.restore()

  hits.push({
    id: app.id,
    x: x - 20,
    y: y - 20,
    w: size + 40,
    h: size + labelGap + 94,
  })
}

function drawWeatherWidget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  weather: PhoneWeather,
) {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h)
  grad.addColorStop(0, '#38bdf8')
  grad.addColorStop(0.55, '#3b82f6')
  grad.addColorStop(1, '#2563eb')

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.42)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetY = 14
  ctx.fillStyle = grad
  pathRoundedRect(ctx, x, y, w, h, 86)
  ctx.fill()
  ctx.restore()

  const sunX = x + 150
  const sunY = y + h / 2
  ctx.fillStyle = '#fde047'
  ctx.beginPath()
  ctx.arc(sunX + 42, sunY, 86, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 104px "DM Sans", system-ui, sans-serif'
  ctx.fillText(weather.temperature, x + 342, y + 96)
  ctx.font = '800 62px "DM Sans", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText(weather.condition, x + 346, y + 166)
  ctx.font = '700 52px "DM Sans", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.fillText(weather.location, x + 346, y + 224)
}

export function createPhoneScreenTexture(
  icons: PhoneIcon[],
  {
    networkLabel,
    searchPlaceholder,
    statusTime,
    weather,
  }: {
    networkLabel: string
    searchPlaceholder: string
    statusTime: string
    weather: PhoneWeather
  },
): PhoneScreenTexture {
  const W = 1080
  const H = 2400
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Wallpaper gradient (dark navy w/ subtle vertical accent)
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0d1224')
  bg.addColorStop(0.55, '#0a0f1f')
  bg.addColorStop(1, '#0c1a2e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Accent glows
  const ga = ctx.createRadialGradient(W * 0.18, H * 0.06, 0, W * 0.18, H * 0.06, W * 0.7)
  ga.addColorStop(0, 'rgba(99,102,241,0.22)')
  ga.addColorStop(1, 'transparent')
  ctx.fillStyle = ga
  ctx.fillRect(0, 0, W, H)

  const gb = ctx.createRadialGradient(W * 0.92, H * 0.95, 0, W * 0.92, H * 0.95, W * 0.7)
  gb.addColorStop(0, 'rgba(61,220,132,0.16)')
  gb.addColorStop(1, 'transparent')
  ctx.fillStyle = gb
  ctx.fillRect(0, 0, W, H)

  // Status bar
  ctx.fillStyle = 'rgba(232,240,255,0.88)'
  ctx.font = '700 58px "DM Sans", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(statusTime, 80, 100)
  ctx.textAlign = 'right'
  ctx.font = '700 56px "DM Sans", system-ui, sans-serif'
  ctx.fillText(networkLabel, W - 80, 100)
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(232,240,255,0.38)'
  ctx.font = '600 31px "DM Sans"'
  ctx.fillText('● ● ●', W / 2, 100)

  // Search bar
  const sx = 80
  const sy = 220
  const sw = W - 160
  const sh = 142
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  pathRoundedRect(ctx, sx, sy, sw, sh, 65)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 2
  ctx.stroke()

  const gx = sx + 90
  const gy = sy + sh / 2
  const gGrad = ctx.createConicGradient(0, gx, gy)
  gGrad.addColorStop(0, '#fbbc05')
  gGrad.addColorStop(0.25, '#ea4335')
  gGrad.addColorStop(0.5, '#4285f4')
  gGrad.addColorStop(0.75, '#34a853')
  gGrad.addColorStop(1, '#fbbc05')
  ctx.fillStyle = gGrad
  pathRoundedRect(ctx, gx - 43, gy - 43, 86, 86, 22)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 53px "DM Sans"'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('G', gx, gy + 1)

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(232,240,255,0.52)'
  ctx.font = '500 49px "DM Sans"'
  ctx.fillText(searchPlaceholder, gx + 84, gy + 2)

  // Weather widget
  drawWeatherWidget(ctx, 80, 430, W - 160, 300, weather)

  // Icon grid — three per row, centered rows (3 + 3 + 1 when seven apps)
  const cols = 3
  const iconSize = 236
  const gap = 64
  const labelGap = 30
  const cellH = iconSize + labelGap + 96
  const startY = 820

  const hitboxes: ScreenHitbox[] = []

  let index = 0
  let row = 0
  while (index < icons.length) {
    const remaining = icons.length - index
    const countInRow = Math.min(cols, remaining)
    const rowW = countInRow * iconSize + (countInRow - 1) * gap
    const rowStart = (W - rowW) / 2
    const y = startY + row * cellH
    for (let c = 0; c < countInRow; c++) {
      drawAppTile(
        ctx,
        icons[index],
        rowStart + c * (iconSize + gap),
        y,
        iconSize,
        labelGap,
        hitboxes,
      )
      index++
    }
    row++
  }

  // Dock — pinned to bottom inset (3-button nav); no separate gesture pill
  const bottomPad = 20
  const dockH = 164
  const dockR = Math.min(78, dockH / 2 - 4)
  const dockY = H - bottomPad - dockH
  const dockW = W - 120
  const dockX = (W - dockW) / 2
  ctx.fillStyle = 'rgba(7,10,18,0.55)'
  pathRoundedRect(ctx, dockX, dockY, dockW, dockH, dockR)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  ctx.stroke()

  const dockCenters = [dockX + dockW * 0.2, dockX + dockW * 0.5, dockX + dockW * 0.8]
  const dockIconY = dockY + dockH / 2
  const navStroke = 'rgba(247,249,255,0.92)'

  dockCenters.forEach((cx, i) => {
    ctx.fillStyle = i === 1 ? 'rgba(61,220,132,0.18)' : 'rgba(255,255,255,0.06)'
    ctx.beginPath()
    ctx.arc(cx, dockIconY, 52, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = navStroke
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const s = 31
    const cy = dockIconY

    if (i === 0) {
      /* Back — left-pointing chevron triangle (classic 3-button nav) */
      ctx.beginPath()
      ctx.moveTo(cx + s * 0.55, cy - s * 0.9)
      ctx.lineTo(cx - s * 0.65, cy)
      ctx.lineTo(cx + s * 0.55, cy + s * 0.9)
      ctx.closePath()
      ctx.stroke()
    } else if (i === 1) {
      /* Home — hollow ring */
      ctx.beginPath()
      ctx.arc(cx, cy, s * 0.78, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      /* Hamburger — three horizontal bars */
      const barW = s * 1.15
      const step = s * 0.42
      for (let row = -1; row <= 1; row++) {
        ctx.beginPath()
        ctx.moveTo(cx - barW, cy + row * step)
        ctx.lineTo(cx + barW, cy + row * step)
        ctx.stroke()
      }
    }
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true

  return {
    texture,
    hitboxes,
    width: W,
    height: H,
    dispose: () => texture.dispose(),
  }
}
