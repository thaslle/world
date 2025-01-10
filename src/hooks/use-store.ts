import { Color } from 'three'
import { Vector } from 'three/examples/jsm/Addons.js'
import { create } from 'zustand'

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
  setCharacterState: (characterState: string) => void
  setPlayerPosition: (position: Vector) => void
  setDebug: () => void
  setPhysics: () => void
}

export const useStore = create<Store>((set) => ({
  playerPosition: null,
  debug: false,
  physics: false,
  terrainSize: 512,
  terrainHeights: new Float32Array(),
  terrainHeightsMax: 0,
  terrainSegments: 0,
  characterState: 'Idle',
  oceanBaseColor: new Color(),

  setCharacterState: (characterState) =>
    set({
      characterState,
    }),

  setPlayerPosition: (position) =>
    set({
      playerPosition: position,
    }),

  setDebug: () => set((state) => ({ debug: !state.debug })),
  setPhysics: () => set((state) => ({ physics: !state.physics })),
}))

