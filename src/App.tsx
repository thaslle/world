import { clsx } from 'clsx'
import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Stats,
  KeyboardControls,
  AdaptiveDpr,
  PerformanceMonitor,
} from '@react-three/drei'
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

import s from './ui/ui.module.scss'

function App() {
  const showDebug = useStore((state) => state.debug)
  const showPhysics = useStore((state) => state.physics)
  const frameloop = useStore((state) => state.frameloop)
  const ready = useStore((state) => state.ready)
  const setQuality = useStore((state) => state.setQuality)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // If mobile, we are only showing the click and drag message
    const handleResize = () => setIsMobile(window.innerWidth < 768)

    // Run on initial render and every resize event
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <Loading />
      <FrameLoop />
      <Suspense>
        <Debug />
        <Leva hidden={!showDebug} />
        <KeyboardControls map={KeyboardMap()}>
          <div className={clsx(s.transition, { [s.show]: ready })}>
            <Canvas
              camera={{ position: [30, 30, 30], fov: 35 }}
              frameloop={frameloop}
              shadows
            >
              {showDebug && <Stats />}

              <AdaptiveDpr pixelated />
              <PerformanceMonitor
                onChange={
                  ({ factor }) =>
                    setQuality(isMobile ? factor * (5.0 - 1.0) + 1.0 : 5) // from 1 to 5
                }
              />

              <Physics debug={showPhysics}>
                <Experience />
              </Physics>
            </Canvas>
            <UI />
          </div>
          <AudioControl />
        </KeyboardControls>
      </Suspense>
    </>
  )
}

export default App

