import { Color, Euler, Vector3 } from 'three'
import { Vector } from 'three/examples/jsm/Addons.js'
import { create } from 'zustand'
import { settings } from '~/config/settings'

type collectiblePositionsProps = {
  position: Vector3
  rotation: Euler
}
type Store = {
  playerPosition: Vector | null
  debug: boolean
  physics: boolean
  terrainSize: number
  terrainHeights: Float32Array
  terrainHeightsMax: number
  terrainSegments: number
  characterState: string
  oceanBaseColor: Color
  collectiblePositions: Array<collectiblePositionsProps>
  collected: number
  lastCollected: number | null
  lastCollectedPosition: collectiblePositionsProps
  showBook: boolean
  showTreasure: boolean
  openTreasure: boolean
  setCharacterState: (characterState: string) => void
  setCollected: (id: number) => void
  setDebug: () => void
  setPhysics: () => void
}

export const useStore = create<Store>((set) => ({
  playerPosition: null,
  debug: false,
  physics: false,
  terrainSize: 300,
  terrainHeights: new Float32Array(),
  terrainHeightsMax: 0,
  terrainSegments: 0,
  characterState: 'Idle',
  oceanBaseColor: new Color(),
  collectiblePositions: new Array(),
  collected: 0,
  lastCollected: null,
  lastCollectedPosition: {
    position: new Vector3(),
    rotation: new Euler(),
  },
  showBook: false,
  openBook: false,
  showTreasure: false,
  openTreasure: false,
  setCharacterState: (characterState) =>
    set({
      characterState,
    }),

  setCollected: (id) =>
    set((state) => {
      const collected =
        id in state.collectiblePositions ? state.collected + 1 : state.collected
      const showBook = collected >= settings.collectiblesNeeded

      return {
        collected: collected,
        lastCollected: id,
        lastCollectedPosition: state.collectiblePositions[id],
        showBook: showBook,

        // Remove collected collectible
        collectiblePositions: state.collectiblePositions.filter(
          (_, index) => index !== id,
        ),
      }
    }),

  setDebug: () => set((state) => ({ debug: !state.debug })),
  setPhysics: () => set((state) => ({ physics: !state.physics })),
}))

