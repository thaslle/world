import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'

export const Level = () => {
  return (
    <RigidBody type="fixed" name="terrain" colliders="trimesh">
      <Terrain />
    </RigidBody>
  )
}
