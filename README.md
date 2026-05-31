# Want Learn how I made the 3D Phone?

This portfolio is built around an interactive 3D phone model. The phone is not a static image or video. It is rendered in WebGL with React Three Fiber, rotates with pointer interaction, has a live canvas-generated home screen, and lets visitors tap app icons to open links or scroll to sections.

The goal was to make the hero section feel like a real Android phone sitting inside the page, while still keeping the project maintainable as a React/Vite app.

## Tech Stack

- React 19
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Postprocessing

## The Important Files

The 3D phone is split into small focused modules:

- `src/components/phone3d/PhoneHero.tsx`  
  Owns the Three.js canvas, camera, lights, controls, phone rig animation, and live status-bar time.

- `src/components/phone3d/PhoneModel.tsx`  
  Builds the actual phone body, screen, glass, buttons, rear cameras, flash, and materials.

- `src/components/phone3d/PhoneScreen.tsx`  
  Creates the clickable screen plane and maps pointer clicks to app icon hitboxes.

- `src/components/phone3d/ScreenTexture.ts`  
  Draws the phone home screen using the Canvas API and turns it into a Three.js texture.

- `src/components/phone3d/phoneIcons.ts`  
  Defines the phone app icons and what each one does when clicked.

- `src/components/phone3d/PhoneMaterials.ts`  
  Contains reusable physical-looking materials for glass, metal, lenses, and the phone body.

- `src/data/site.json`  
  The single source of truth for editable portfolio content, links, phone labels, and weather widget text.

## How the Phone Is Rendered

The phone lives inside a normal React component, but the visual phone itself is rendered inside a React Three Fiber `<Canvas>`.

`PhoneHero.tsx` sets up:

- `PerspectiveCamera`
- ambient, directional, and point lights
- `Environment` lighting from Drei
- `OrbitControls` for drag rotation
- `Bloom` and `Vignette` for subtle visual polish

The phone is wrapped in a small animated rig:

```tsx
useFrame((state) => {
  const node = group.current
  if (!node) return
  const targetTiltX = pointer.y * 0.08
  const targetTiltY = pointer.x * 0.16
  node.rotation.x += (targetTiltX - node.rotation.x) * 0.05
  node.rotation.y += (targetTiltY - node.rotation.y) * 0.05
  node.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.05
})
```

This gives the device a gentle floating motion and a subtle pointer-following tilt. The phone still remains draggable because `OrbitControls` handles user rotation.

## Building the Phone Body

The phone body is not imported from Blender. It is built procedurally in code.

`PhoneModel.tsx` creates a rounded-rectangle shape, then extrudes it into a thin slab:

- rounded corners
- subtle bevels
- thin phone depth
- separate front and back surfaces
- front glass
- rear glass
- camera modules
- side buttons
- bottom USB-C and speaker details

The custom geometry is created with `THREE.Shape` and `THREE.ExtrudeGeometry`. This gives more control than using a generic rounded box, especially for modern thin-phone proportions.

## Screen Shape and UV Mapping

The phone screen is also a rounded rectangle, but it needs correct UVs so the canvas texture maps cleanly.

`PhoneScreen.tsx` builds a rounded `ShapeGeometry`, then recalculates UV coordinates manually:

```tsx
uvs[i * 2 + 0] = (px + w / 2) / w
uvs[i * 2 + 1] = (py + h / 2) / h
```

This makes the generated home-screen texture line up perfectly inside the rounded phone display.

## The Home Screen Is a Canvas Texture

The phone home screen is drawn with the browser Canvas API in `ScreenTexture.ts`.

It draws:

- wallpaper gradient
- status bar time
- `5G` network label
- search bar
- weather widget
- app icons
- labels
- Android-style bottom navigation dock

After drawing everything onto a hidden `<canvas>`, the canvas becomes a Three.js texture:

```ts
const texture = new THREE.CanvasTexture(canvas)
texture.colorSpace = THREE.SRGBColorSpace
texture.anisotropy = 16
texture.minFilter = THREE.LinearMipmapLinearFilter
texture.magFilter = THREE.LinearFilter
texture.needsUpdate = true
```

That texture is then placed on the phone’s screen mesh.

## Live System Time

The time on the phone is not hardcoded. `PhoneHero.tsx` reads the visitor’s local system time and updates it every minute.

The update is aligned to the next minute boundary:

```tsx
const msUntilNextMinute =
  (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 100
```

When the time changes, React regenerates the canvas texture, so the phone status bar stays current.

## Clickable App Icons

The phone icons are not just visual. They are clickable.

While drawing each app tile, `ScreenTexture.ts` also stores a hitbox:

```ts
hits.push({
  id: app.id,
  x: x - 20,
  y: y - 20,
  w: size + 40,
  h: size + labelGap + 94,
})
```

When the user clicks the 3D screen, `PhoneScreen.tsx` receives the click UV coordinate, converts it back into canvas pixels, checks which hitbox was clicked, and then runs the matching action.

The icons can:

- open GitHub
- open LinkedIn
- open the resume folder
- scroll to Projects
- scroll to Work Experience
- scroll to About
- scroll to Contact

## Why Canvas Instead of HTML?

I originally wanted the phone to feel like a real object, not just a div floating over the page.

Using a canvas texture means:

- the UI rotates with the phone
- the screen follows the phone perspective
- the glass overlay and reflections sit naturally above it
- everything remains inside the 3D scene
- the phone can be animated and lit as one object

The tradeoff is that click handling needs custom hitboxes, but that also makes the interaction precise and lightweight.

## Materials and Visual Polish

The realistic feel comes from several layers:

- metal-like frame material
- transparent front glass material
- dark glossy back plate
- lens glass and lens ring materials
- tiny flash texture
- postprocessing bloom
- vignette
- environment lighting

The result is a phone that feels dimensional without needing a heavy external model file.

## Mobile Optimization

The desktop and mobile hero layouts are intentionally different.

On desktop:

- the phone and hero copy sit side by side
- the phone is larger
- the hero text can use parallax/fade effects

On phone browsers:

- the phone is prioritized at the top
- the helper hint is hidden
- hero text appears immediately after the phone
- location and metrics can continue below the first fold
- carousels render only the active card to prevent huge blank gaps

This keeps the first mobile screen focused on the phone and headline.