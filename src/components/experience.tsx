import { useControls } from 'leva'

import { Grass } from './grass'
import { Level } from './level'
import { Player } from './player'

import { settings } from '~/config/settings'

export const Experience = () => {
  const { BACKGROUND } = useControls('Sky', {
    BACKGROUND: settings.background, //#d9ffe8
  })

  return (
    <>
      <ambientLight intensity={settings.ambientLight.intensity} />

      <directionalLight
        intensity={settings.directionalLight.intensity}
        position={settings.directionalLight.position}
        color={settings.directionalLight.color}
      />

      <color attach="background" args={[BACKGROUND]} />
      <fog
        attach="fog"
        args={[settings.fog.color, settings.fog.near, settings.fog.far]}
      />

      <Player />
      <Grass />
      <Level />
    </>
  )
}

