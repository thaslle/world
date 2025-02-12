import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats, KeyboardControls, AdaptiveDpr } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Leva } from 'leva'

import { Experience } from './components/experience'
import { Debug } from './components/debug'
import { AudioControl } from './audio-control'
import { Loading } from './ui/loading'
import { UI } from './ui'
import { FrameLoop } from './components/frameloop'

import { KeyboardMap } from './utils/keyboard-map'
import { useStore } from './hooks/use-store'

function App() {
  const showDebug = useStore((state) => state.debug)
  const showPhysics = useStore((state) => state.physics)
  const frameloop = useStore((state) => state.frameloop)

  return (
    <>
      <Loading />
      <FrameLoop />
      <Suspense>
        <Debug />
        <Leva hidden={!showDebug} />
        <KeyboardControls map={KeyboardMap()}>
          <Canvas
            camera={{ position: [3, 3, 3], fov: 35 }}
            frameloop={frameloop}
            shadows
          >
            {showDebug && <Stats />}

            <AdaptiveDpr pixelated />

            <Physics debug={showPhysics}>
              <Experience />
            </Physics>
          </Canvas>
          <UI />
          <AudioControl />
        </KeyboardControls>
      </Suspense>
    </>
  )
}

export default App

