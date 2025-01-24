import { Color, Vector3 } from 'three'

export const settings = {
  background: '#79fffa',
  fog: { color: '#b0fce5', near: 80.0, far: 350.0 },
  ambientLight: { intensity: 2 },
  directionalLight: {
    intensity: 7,
    position: new Vector3(40, 100, 20),
    color: new Color('#feffe4'),
  },
  waterHeight: 1.65,
  cameraDistance: 7.6,
  collectibleGrabDistance: 3,
  collectibles: 20,
  collectiblesNeeded: 3,
  trees: 12,
}

