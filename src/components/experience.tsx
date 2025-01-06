import { Environment } from '@react-three/drei'

import { useControls } from 'leva'

import { Grass } from './grass'
import { Level } from './level'
import { Player } from './player'

export const Experience = () => {
  const { BACKGROUND } = useControls('Sky', {
    BACKGROUND: '#d9ffe8',
  })

  return (
    <>
      <Environment preset="dawn" />
      <ambientLight intensity={1.8} />

      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 65, 90]} />

      <Player />
      <Grass />
      <Level />
    </>
  )
}
