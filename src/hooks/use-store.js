import { create } from 'zustand'

const debug = false
const physics = false

export const useStore = create((set) => ({
  playerPosition: null,
  debug: debug ? true : false,
  physics: physics ? true : false,
  terrainSize: 500,
  terrainHeights: null,
  terrainHeightsMinMax: [0, 0],
  terrainSegments: null,

  characterState: 'Idle',
  setCharacterState: (characterState) =>
    set({
      characterState,
    }),

  setDebug: () => set((state) => ({ debug: !state.debug })),
  setPhysics: () => set((state) => ({ physics: !state.physics })),
}))
