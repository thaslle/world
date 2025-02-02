import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'
import { Water } from './water'
import { Base } from './base'
import { Trees } from './trees'
import { Rocks } from './rocks'
import { Sky } from './sky'

export const Level = () => {
  return (
    <>
      <Sky />
      <Base />
      <Water />
      <Trees />

      <RigidBody type="fixed" name="terrain" colliders="trimesh">
        <Terrain />
        <Rocks />
      </RigidBody>
    </>
  )
}

