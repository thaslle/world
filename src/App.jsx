import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, Stats, KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Leva } from 'leva'

import { Experience } from './components/experience'

import { Controls } from './config/controls'
import { Debug } from './components/debug'

import { useStore } from './hooks/use-store'

function App() {
  const keyboardMap = useMemo(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.run, keys: ['Shift'] },
    ],
    [],
  )

  const showDebug = useStore((state) => state.debug)
  const showPhysics = useStore((state) => state.physics)

  return (
    <>
      <Debug />
      <Leva hidden={!showDebug} />
      <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }} shadows>
          {showDebug && <Stats />}

          <Physics debug={showPhysics}>
            <Experience />
          </Physics>

          {showPhysics && (
            <Grid
              position={[0, 0.1, 0]}
              sectionSize={1}
              sectionColor={'purple'}
              sectionThickness={1}
              cellSize={0.2}
              cellColor={'#6f6f6f'}
              cellThickness={0.6}
              infiniteGrid
              fadeDistance={50}
              fadeStrength={5}
            />
          )}
        </Canvas>
      </KeyboardControls>
    </>
  )
}

export default App
