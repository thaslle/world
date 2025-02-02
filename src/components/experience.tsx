import { Environment } from '@react-three/drei'

import { Grass } from './grass'
import { Level } from './level'
import { Player } from './player'
import { Assets } from './assets'

import { settings } from '~/config/settings'

export const Experience = () => {
  return (
    <>
      <ambientLight intensity={settings.ambientLight.intensity} />
      <Environment preset="forest" environmentIntensity={2} />

      <fog
        attach="fog"
        args={[settings.fog.color, settings.fog.near, settings.fog.far]}
      />

      <Level />
      <Grass />
      <Player />
      <Assets />
    </>
  )
}

