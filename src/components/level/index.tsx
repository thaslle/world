import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'
import { Water } from './water'
import { Base } from './base'
import { Tree } from './tree'

export const Level = () => {
  return (
    <>
      <RigidBody type="fixed" name="terrain" colliders="trimesh">
        <Terrain />
      </RigidBody>

      <Tree position={[45, 4, 90]} />
      <Water />
      <Base />
    </>
  )
}

