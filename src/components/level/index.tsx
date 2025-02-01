import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'
import { Water } from './water'
import { Base } from './base'
import { Trees } from './trees'
import { Rocks } from './rocks'

export const Level = () => {
  return (
    <>
      <RigidBody type="fixed" name="terrain" colliders="trimesh">
        <Terrain />
      </RigidBody>

      <Trees />
      <Rocks />
      <Water />
      <Base />
    </>
  )
}

