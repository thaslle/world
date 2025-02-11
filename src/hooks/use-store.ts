import { Color, Euler, Vector3 } from 'three'
import { create } from 'zustand'
import { settings } from '~/config/settings'

type CollectiblePositionsProps = {
  position: Vector3
  rotation: Euler
}

export type StatusProps =
  | 'loading'
  | 'wait'
  | 'learn'
  | 'find'
  | 'place'
  | 'book'
  | 'treasure'
  | 'quote'
  | 'cheers'
  | 'explore'
  | 'finished'

type Store = {
  ready: boolean
  debug: boolean
  physics: boolean
  terrainLoaded: boolean
  terrainSize: number
  terrainHeights: Float32Array
  terrainHeightsMax: number
  terrainSegments: number
  characterState: string
  oceanBaseColor: Color
  collectiblePositions: Array<CollectiblePositionsProps>
  collected: number
  lastCollected: number | null
  lastCollectedPosition: CollectiblePositionsProps
  status: StatusProps
  setReady: (ready: boolean) => void
  setCharacterState: (characterState: string) => void
  setCollected: (id: number) => void
  setStatus: (status: StatusProps) => void
  setDebug: () => void
  setPhysics: () => void
}

export const useStore = create<Store>((set) => ({
  ready: false,
  debug: false,
  physics: false,
  terrainLoaded: false,
  terrainSize: settings.terrainSize,
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
  status: 'loading',
  setReady: (ready) =>
    set({
      ready,
    }),
  setCharacterState: (characterState) =>
    set({
      characterState,
    }),

  setCollected: (id) =>
    set((state) => {
      const collected =
        id in state.collectiblePositions ? state.collected + 1 : state.collected
      const showBook =
        collected >= settings.collectiblesNeeded && state.status === 'find'

      if (showBook) state.setStatus('place')

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

  setStatus: (status) =>
    set({
      status,
    }),

  setDebug: () => set((state) => ({ debug: !state.debug })),
  setPhysics: () => set((state) => ({ physics: !state.physics })),
}))

