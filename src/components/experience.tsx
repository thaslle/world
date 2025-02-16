import { useRef } from 'react'
import { Environment } from '@react-three/drei'
import { RapierRigidBody } from '@react-three/rapier'

import { Grass } from './grass'
import { Level } from './level'
import { Player } from './player'
import { Assets } from './assets'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

export const Experience = () => {
  const playerRef = useRef<RapierRigidBody>(null)
  const ready = useStore((state) => state.ready)
  const quality = useStore((state) => state.quality)

  return (
    ready && (
      <>
        <ambientLight intensity={settings.ambientLight.intensity} />
        <Environment preset="forest" environmentIntensity={2} />

        <fog
          attach="fog"
          args={[settings.fog.color, settings.fog.near, settings.fog.far]}
        />

        <Level />
        {quality > settings.highQuality && <Grass playerRef={playerRef} />}
        <Player playerRef={playerRef} />
        <Assets />
      </>
    )
  )
}

