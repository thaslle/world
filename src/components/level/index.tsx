import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'
import { Water } from './water'

export const Level = () => {
  return (
    <>
      <RigidBody type="fixed" name="terrain" colliders="trimesh">
        <Terrain />
      </RigidBody>

      <Water />
    </>
  )
}
