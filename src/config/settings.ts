import { Color, Vector3 } from 'three'

export const settings = {
  ambientLight: { intensity: 2 },
  directionalLight: {
    intensity: 7,
    position: new Vector3(80, 100, 40),
    color: new Color('#feffe4'),
  },
}
