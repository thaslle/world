import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats, KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Leva } from 'leva'

import { Experience } from './components/experience'
import { Debug } from './components/debug'

import { Controls } from './config/controls'
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
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          {showDebug && <Stats />}

          <Physics debug={showPhysics}>
            <Experience />
          </Physics>
        </Canvas>
      </KeyboardControls>
    </>
  )
}

export default App

