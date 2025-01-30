import { Environment } from '@react-three/drei'
import { useControls } from 'leva'

import { Grass } from './grass'
import { Level } from './level'
import { Player } from './player'
import { Assets } from './assets'

import { settings } from '~/config/settings'

export const Experience = () => {
  const { BACKGROUND } = useControls('Sky', {
    BACKGROUND: settings.background, //#d9ffe8
  })

  return (
    <>
      <ambientLight intensity={settings.ambientLight.intensity} />
      <Environment preset="forest" environmentIntensity={2} />

      <color attach="background" args={[BACKGROUND]} />
      <fog
        attach="fog"
        args={[settings.fog.color, settings.fog.near, settings.fog.far]}
      />

      <Player />
      <Grass />
      <Level />
      <Assets />
    </>
  )
}

