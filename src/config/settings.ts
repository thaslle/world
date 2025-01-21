import { Color, Vector3 } from 'three'

export const settings = {
  ambientLight: { intensity: 2 },
  directionalLight: {
    intensity: 7,
    position: new Vector3(40, 100, 20),
    color: new Color('#feffe4'),
  },
  waterHeight: 1.65,
}

