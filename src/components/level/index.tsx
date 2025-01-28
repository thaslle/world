import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'
import { Water } from './water'
import { Base } from './base'
import { Trees } from './trees'

export const Level = () => {
  return (
    <>
      <RigidBody type="fixed" name="terrain" colliders="trimesh">
        <Terrain />
      </RigidBody>

      <Trees />
      <Water />
      <Base />
    </>
  )
}

