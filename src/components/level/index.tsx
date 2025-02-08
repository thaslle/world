import { RigidBody } from '@react-three/rapier'
import { Terrain } from './terrain'
import { Water } from './water'
import { Base } from './base'
import { Trees } from './trees'
import { Rocks } from './rocks'
import { Sky } from './sky'
import { Boundaries } from './boundaries'
import { Audio } from './audio'

import { settings } from '~/config/settings'

export const Level = () => {
  return (
    <>
      <Audio />
      <Sky />
      <Base />
      <Water />
      <Trees />
      <Boundaries />

      <RigidBody
        type="fixed"
        name="terrain"
        colliders="trimesh"
        collisionGroups={settings.groupLevel}
      >
        <Terrain />
        <Rocks />
      </RigidBody>
    </>
  )
}

