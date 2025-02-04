import { useRef } from 'react'
import { Group, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { CameraControls, Sphere } from '@react-three/drei'
import { useControls } from 'leva'
import {
  MeshCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
  vec3,
} from '@react-three/rapier'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

type JointProps = {
  playerRef: React.RefObject<RapierRigidBody>
}

export const Joint: React.FC<JointProps> = ({ playerRef }) => {
  const { ROTATE } = useControls('Character', {
    ROTATE: { value: false },
  })

  const { CAMERA_DISTANCE, CAMERA_HEIGHT } = useControls('Camera', {
    CAMERA_DISTANCE: {
      value: settings.cameraDistance,
      min: 0.1,
      max: 20.0,
      step: 0.1,
    },
    CAMERA_HEIGHT: { value: 1.0, min: 0.1, max: 20.0, step: 0.1 },
  })

  const characterState = useStore((state) => state.characterState)

  const playerPosition = useRef<RapierRigidBody>(null)
  const jointPosition = useRef<RapierRigidBody>(null)
  const cameraPosition = useRef<Group>(null)
  const cameraRef = useRef<CameraControls>(null)
  const cameraTarget = useRef(new Vector3(0, 0, 0))
  const positionWorldPosition = new Vector3()

  useRevoluteJoint(playerPosition, jointPosition, [
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
  ])

  useFrame(() => {
    if (
      !cameraRef.current ||
      !playerRef.current ||
      !cameraTarget.current ||
      !cameraPosition.current ||
      !playerPosition.current ||
      !jointPosition.current
    )
      return

    playerPosition.current.setTranslation(playerRef.current.translation(), true)
    playerPosition.current.setRotation(playerRef.current.rotation(), true)

    // Set camera to follow the player when it's moving,
    // But, when character is Sit, you can rotate the camera around
    if (characterState !== 'Sit' && !ROTATE) {
      cameraTarget.current = vec3(playerRef.current.translation())
      cameraPosition.current.getWorldPosition(positionWorldPosition)

      //   console.log(
      //     jointPosition.current.translation().y,
      //     positionWorldPosition.y,
      //   )

      if (positionWorldPosition.y < jointPosition.current.translation().y)
        positionWorldPosition.y = jointPosition.current.translation().y

      cameraRef.current.setLookAt(
        positionWorldPosition.x,
        positionWorldPosition.y,
        positionWorldPosition.z,
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z,
        true,
      )
    }
  })

  return (
    <>
      <RigidBody
        ref={playerPosition}
        type="kinematicPosition"
        colliders={false}
        collisionGroups={settings.groupKnots}
      >
        <mesh>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial opacity={0} transparent />
        </mesh>

        <CameraControls ref={cameraRef} />

        <group
          ref={cameraPosition}
          position-y={CAMERA_HEIGHT}
          position-z={-CAMERA_DISTANCE}
        />
      </RigidBody>

      <RigidBody
        ref={jointPosition}
        type="dynamic"
        collisionGroups={settings.groupKnots}
        linearDamping={0.8}
        angularDamping={0.1}
      >
        <MeshCollider type="ball">
          <Sphere args={[5]} position={[0, CAMERA_DISTANCE, 0]}>
            <meshPhysicalMaterial opacity={0} transparent />
          </Sphere>
        </MeshCollider>
      </RigidBody>
    </>
  )
}
