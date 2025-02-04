import { interactionGroups } from '@react-three/rapier'
import { Color, Vector3 } from 'three'

export const settings = {
  fog: { color: '#b0fce5', near: 80.0, far: 350.0 },
  ambientLight: { intensity: 2 },
  levelRadius: 512,
  terrainSize: 300,
  directionalLight: {
    intensity: 7,
    position: new Vector3(40, 100, 20),
    color: new Color('#feffe4'),
  },
  waterHeight: 1.65,
  cameraDistance: 9.5,
  collectibleGrabDistance: 3,
  collectibles: 20,
  collectiblesNeeded: 3,
  groupPlayer: interactionGroups(0, [1]),
  groupLevel: interactionGroups(1),
  groupCamera: interactionGroups(2, [3]),
  groupKnots: interactionGroups(3, [1, 2]),
}

