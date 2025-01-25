import { useRef } from 'react'
import { Vector3, MathUtils, Clock, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { RapierRigidBody, vec3 } from '@react-three/rapier'
import { useControls } from 'leva'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

const getCameraYVelocity = (
  curVel: Vector3,
  threshold = 0.2,
  maxLimit = 8,
  expFactor = 1.5,
) => {
  // Activated when player is moving down
  if (curVel.y < threshold) {
    const normalizedY = Math.min(
      maxLimit,
      Math.pow(Math.abs(curVel.y * 0.05) / threshold, expFactor) * maxLimit,
    )
    return normalizedY
  }

  // If conditions aren't met, return 0 or the original curVel.y
  return 0
}

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

  const customClock = useRef(new Clock())
  const cameraRef = useRef<CameraControls>(null)

  const cameraTarget = useRef(new Vector3(0, 0, 0))
  const cameraPosition = useRef<Group>(null)
  const cameraYVelocity = useRef(0)
  const lastElapsedTime = useRef(0)
  const positionWorldPosition = new Vector3()

  const characterState = useStore((state) => state.characterState)

  useFrame(({ clock }) => {
    if (
      !cameraRef.current ||
      !playerRef.current ||
      !cameraTarget.current ||
      !cameraPosition.current ||
      !customClock.current
    )
      return

    // Clock functions
    const generalElapsedTime = clock.getElapsedTime()

    const curVel = vec3(playerRef.current.linvel())

    // Set camera to follow the player when it's moving,
    // But, when character is Sit, you can rotate the camera around
    if (characterState !== 'Sit' && !ROTATE) {
      // Log last camera velocity
      const lastCameraYVelocity = cameraYVelocity.current

      // Update camera Y from time to time to prevent it from shaking too much
      if (lastElapsedTime.current !== Math.floor(generalElapsedTime * 10)) {
        //Change Y position based on Y velocity
        if (Math.abs(curVel.x) > 0.01 || Math.abs(curVel.z) > 0.01)
          cameraYVelocity.current = getCameraYVelocity(curVel)

        const cameraYVelocityMid =
          (lastCameraYVelocity + cameraYVelocity.current) / 2

        cameraPosition.current.position.y = MathUtils.lerp(
          cameraPosition.current.position.y,
          cameraYVelocityMid + CAMERA_HEIGHT,
          0.3,
        )
      }

      cameraTarget.current = vec3(playerRef.current.translation())
      cameraPosition.current.getWorldPosition(positionWorldPosition)

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

    //Update last elapsed time
    lastElapsedTime.current = Math.floor(generalElapsedTime * 10)
  })

  return (
    <>
      <CameraControls ref={cameraRef} />

      <group
        ref={cameraPosition}
        position-y={CAMERA_HEIGHT}
        position-z={-CAMERA_DISTANCE}
      />
    </>
  )
}

