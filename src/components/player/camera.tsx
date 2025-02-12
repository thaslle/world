import { useEffect, useRef } from 'react'
import { Group, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { useControls } from 'leva'
import {
  RapierRigidBody,
  RigidBody,
  usePrismaticJoint,
  vec3,
} from '@react-three/rapier'

import { settings } from '~/config/settings'

type CameraProps = {
  playerRef: React.RefObject<RapierRigidBody>
}

export const Camera: React.FC<CameraProps> = ({ playerRef }) => {
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

  const playerPosition = useRef<RapierRigidBody>(null)
  const jointPosition = useRef<RapierRigidBody>(null)
  const cameraPosition = useRef<Group>(null)
  const cameraTarget = useRef(new Vector3(0, 0, 0))
  const cameraLookAt = useRef(new Vector3(0, 0, 0))

  const positionWorldPosition = new Vector3()

  useEffect(() => {
    if (!playerRef.current || !jointPosition.current) return

    const playerCopyPos = playerRef.current.translation()
    playerCopyPos.y += 0.5

    jointPosition.current.setTranslation(playerCopyPos, true)
    jointPosition.current.setRotation(playerRef.current.rotation(), true)
  }, [])

  usePrismaticJoint(playerPosition, jointPosition, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ])

  useFrame(({ camera }) => {
    if (
      !playerRef.current ||
      !cameraTarget.current ||
      !cameraLookAt.current ||
      !cameraPosition.current ||
      !playerPosition.current ||
      !jointPosition.current
    )
      return

    playerPosition.current.setTranslation(playerRef.current.translation(), true)
    playerPosition.current.setRotation(playerRef.current.rotation(), true)

    const jointPos = jointPosition.current.translation()
    const jointVel = jointPosition.current.linvel()

    // Kep it still
    if (jointVel.y > 0)
      jointPosition.current.setLinvel(new Vector3(0, 0, 0), true)
    else
      jointPosition.current.setLinvel(new Vector3(0, jointVel.y * 0.5, 0), true)

    if (jointPos.y < playerRef.current.translation().y)
      jointPosition.current.setTranslation(
        new Vector3(jointPos.x, playerRef.current.translation().y, jointPos.z),
        true,
      )

    // Set camera to follow the player when it's moving,
    if (!ROTATE) {
      cameraTarget.current = vec3(playerRef.current.translation())
      cameraPosition.current.getWorldPosition(positionWorldPosition)

      if (positionWorldPosition.y < jointPos.y)
        positionWorldPosition.y = jointPos.y

      if (positionWorldPosition.y < settings.waterHeight)
        positionWorldPosition.y = settings.waterHeight + 0.5

      camera.position.lerp(positionWorldPosition, 0.05)
      cameraLookAt.current.lerp(cameraTarget.current, 0.05)

      camera.lookAt(cameraLookAt.current)
    }
  })

  return (
    <>
      <RigidBody
        ref={playerPosition}
        type="kinematicPosition"
        colliders={false}
        collisionGroups={settings.groupCamera}
        canSleep={false}
      >
        <mesh position={[0, 0, -CAMERA_DISTANCE]}>
          <boxGeometry args={[1, CAMERA_HEIGHT * 10, 1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {ROTATE && <CameraControls />}

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
        gravityScale={20}
        canSleep={false}
        linearDamping={0.8}
      >
        <mesh position={[0, 0, -CAMERA_DISTANCE]}>
          <capsuleGeometry args={[0.65, 1.7, 3, 6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </RigidBody>
    </>
  )
}

