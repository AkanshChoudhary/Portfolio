import * as THREE from 'three'

/**
 * Premium PBR materials calibrated for an Android product render.
 * Returned via factory functions so each component instance gets its
 * own material that can be safely disposed when the scene unmounts.
 */

export function createFrameMaterial(): THREE.MeshPhysicalMaterial {
  // Brushed graphite — solid metal feel without mirror-like reflections.
  return new THREE.MeshPhysicalMaterial({
    color: '#43464f',
    metalness: 0.85,
    roughness: 0.5,
    clearcoat: 0.45,
    clearcoatRoughness: 0.32,
    envMapIntensity: 0.7,
  })
}

export function createBackGlassMaterial(): THREE.MeshPhysicalMaterial {
  // Slightly lighter, brushed-glass look for the rear panel.
  return new THREE.MeshPhysicalMaterial({
    color: '#5b6069',
    metalness: 0.55,
    roughness: 0.42,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.05,
  })
}

export function createScreenGlassMaterial(): THREE.MeshPhysicalMaterial {
  // Thin transparent layer that gives the screen an obvious sheen.
  return new THREE.MeshPhysicalMaterial({
    color: '#060914',
    roughness: 0.05,
    metalness: 0,
    transmission: 0.08,
    transparent: true,
    opacity: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    depthWrite: false,
  })
}

export function createButtonMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: '#454850',
    metalness: 1,
    roughness: 0.32,
  })
}

export function createLensRingMaterial(): THREE.MeshPhysicalMaterial {
  /** Dark anodised aluminium barrel + polished chamfer — picks up env highlights. */
  return new THREE.MeshPhysicalMaterial({
    color: '#252830',
    metalness: 0.92,
    roughness: 0.2,
    envMapIntensity: 1.5,
    clearcoat: 0.9,
    clearcoatRoughness: 0.14,
  })
}

/** Outer lens element: glass-like reflections + transmission tint. */
export function createLensGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#131c30',
    metalness: 0.12,
    roughness: 0.035,
    envMapIntensity: 2.5,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    transmission: 0.42,
    thickness: 0.45,
    ior: 1.54,
    attenuationDistance: 0.22,
    attenuationColor: new THREE.Color('#0a1628'),
  })
}

/** Dark sensor stack / pupil centre — diffuse, not mirror-like. */
export function createLensPupilMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#06080d',
    metalness: 0.32,
    roughness: 0.9,
    envMapIntensity: 0.28,
  })
}

/** Soft AR-coating glint (offset highlight on each lens). */
export function createLensCoatingGlintMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#7f9fd4',
    metalness: 0.2,
    roughness: 0.12,
    transparent: true,
    opacity: 0.38,
    envMapIntensity: 1.8,
    emissive: new THREE.Color('#1a3050'),
    emissiveIntensity: 0.15,
  })
}

/** IR / spectral sensor window beside cover glass — slight blue-grey sheen. */
export function createLensIRWindowMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#2a4870',
    metalness: 0.52,
    roughness: 0.38,
    transparent: true,
    opacity: 0.62,
    envMapIntensity: 1.35,
    emissive: new THREE.Color('#101f30'),
    emissiveIntensity: 0.07,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2,
  })
}

/** Textured iris disc — vignette rings read as cavity behind glass. */
export function createLensIrisBackingMaterial(map: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map,
    color: '#0f1826',
    metalness: 0.42,
    roughness: 0.74,
    envMapIntensity: 0.75,
  })
}
