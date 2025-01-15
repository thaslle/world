import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain-csm'
import { Water } from './water'
import { Base } from './base'

export const Level = () => {
  return (
    <>
      <RigidBody type="fixed" name="terrain" colliders="trimesh">
        <Terrain />
      </RigidBody>

      <Water />
      <Base />
    </>
  )
}

