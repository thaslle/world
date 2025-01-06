import { useRef } from 'react'
import { Vector3, MathUtils, Clock, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { CameraControls, useKeyboardControls } from '@react-three/drei'
import {
  RigidBody,
  CapsuleCollider,
  euler,
  quat,
  vec3,
  RapierRigidBody,
} from '@react-three/rapier'
import { useControls } from 'leva'

import { Controls } from '~/config/controls'
import { useStore } from '~/hooks/use-store'
import { Maria } from './maria'

export const Player = () => {
  const {
    WALK_SPEED,
    RUN_SPEED,
    ROTATION_SPEED,
    JUMP_FORCE,
    WAITING_TIME,
    GRAVITY_SCALE,
    POSITION_X,
    POSITION_Y,
    POSITION_Z,
  } = useControls('Character', {
    WALK_SPEED: { value: 2.0, min: 0.1, max: 8.0, step: 0.1 },
    RUN_SPEED: { value: 5.0, min: 0.2, max: 30, step: 0.1 },
    ROTATION_SPEED: { value: 2.5, min: 0.2, max: 12, step: 0.1 },
    JUMP_FORCE: { value: 3.8, min: 0.2, max: 12, step: 0.1 },
    GRAVITY_SCALE: { value: 1.5, min: 0.2, max: 12, step: 0.1 },
    WAITING_TIME: { value: 10.0, min: 0.1, max: 30, step: 0.1 },
    POSITION_X: { value: 20, min: -1000, max: 1000, step: 0.5 },
    POSITION_Y: { value: 11, min: -1000, max: 1000, step: 0.5 },
    POSITION_Z: { value: 50, min: -1000, max: 1000, step: 0.5 },
  })

  const { CAMERA_DISTANCE, CAMERA_HEIGHT } = useControls('Camera', {
    CAMERA_DISTANCE: { value: 4.6, min: 0.1, max: 20.0, step: 0.1 },
    CAMERA_HEIGHT: { value: 1.0, min: 0.1, max: 20.0, step: 0.1 },
  })

  const customClock = useRef(new Clock())

  const vel = new Vector3()
  const rotVel = new Vector3()
  const playerinTheAir = useRef(true)
  const playerLanded = useRef(false)
  const playerLastJump = useRef(0)

  const playerRef = useRef<RapierRigidBody>(null) // Rigid Body reference
  const characterRef = useRef<Group>(null) // 3D models reference
  const cameraRef = useRef<CameraControls>(null)
  const movement = useRef({
    x: 1,
    z: 0,
    w: 0,
  })

  const cameraTarget = useRef(new Vector3(0, 0, 0))
  const cameraPosition = useRef<Group>(null)
  const positionWorldPosition = new Vector3()

  const { characterState, setCharacterState, setPlayerPosition } = useStore()

  const [, get] = useKeyboardControls()

  useFrame(({ clock }) => {
    if (
      !cameraRef.current ||
      !playerRef.current ||
      !characterRef.current ||
      !cameraTarget.current ||
      !cameraPosition.current ||
      !customClock.current
    )
      return

    // Clock functions
    const elapsedTime = customClock.current.getElapsedTime()
    const generalElapsedTime = clock.getElapsedTime()

    cameraTarget.current = vec3(playerRef.current.translation())
    cameraPosition.current.getWorldPosition(positionWorldPosition)

    // Set camera to follow the player when it's moving,
    // But, when character is Sit, you can rotate the camera around
    if (characterState !== 'Sit') {
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

    // Clean the movement variables
    rotVel.x = 0
    rotVel.y = 0
    rotVel.z = 0

    vel.x = 0
    vel.y = 0
    vel.z = 0

    // This reference is used to store whether the player is moving forwards or backwards
    movement.current.w = 0

    // Store current velocity
    const curVel = playerRef.current.linvel()

    // If the player is running
    const MOVEMENT_SPEED = get().run ? RUN_SPEED : WALK_SPEED

    // Moving forward
    if (get()[Controls.forward]) {
      vel.z += MOVEMENT_SPEED

      movement.current.x = 1
      movement.current.w = 1

      // Player is facing away from the camera
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        0,
        0.3,
      )
    }
    if (get()[Controls.backward]) {
      vel.z -= MOVEMENT_SPEED

      movement.current.x = -1
      movement.current.w = 1

      // Player facing the camera
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        Math.PI,
        0.3,
      )
    }

    // Enable the player to rotate without any lateral movement
    const isMovingZ = Math.abs(vel.z) >= MOVEMENT_SPEED

    if (get()[Controls.left]) {
      if (!isMovingZ) vel.z += MOVEMENT_SPEED * 0.5 * movement.current.x

      rotVel.y += ROTATION_SPEED * movement.current.x
    }
    if (get()[Controls.right]) {
      if (!isMovingZ) vel.z += MOVEMENT_SPEED * 0.5 * movement.current.x

      rotVel.y -= ROTATION_SPEED * movement.current.x
    }

    playerRef.current.setAngvel(rotVel, true)

    // Apply rotation to x and z to go in the right direction
    const eulerRot = euler().setFromQuaternion(
      quat(playerRef.current.rotation()),
    )

    vel.applyEuler(eulerRot)

    // Allow the character to jump if it isn't currently in the air
    if (
      get()[Controls.jump] &&
      !playerinTheAir.current &&
      playerLanded.current &&
      generalElapsedTime - playerLastJump.current > 0.8
    ) {
      vel.y += JUMP_FORCE
      playerinTheAir.current = true
      playerLanded.current = false
      playerLastJump.current = generalElapsedTime
    } else {
      vel.y = curVel.y
    }

    // Apply Velocity
    playerRef.current.setLinvel(vel, true)

    //Player animations
    if (playerinTheAir.current === true) {
      if (characterState !== 'Jump') setCharacterState('Jump')
    } else if (
      (Math.abs(vel.x) > WALK_SPEED || Math.abs(vel.z) > WALK_SPEED) &&
      movement.current.w === 1
    ) {
      customClock.current.start() // Reset counting
      if (characterState !== 'Run') setCharacterState('Run')
    } else if (Math.abs(vel.x) > 0.05 || Math.abs(vel.z) > 0.05) {
      customClock.current.start() // Reset counting
      if (characterState !== 'Walk') setCharacterState('Walk')
    } else {
      if (
        characterState !== 'Idle' &&
        characterState !== 'Sit' &&
        characterState !== 'StandUp' &&
        characterState !== 'SitDown'
      ) {
        customClock.current.start()
        setCharacterState('Idle')
      } else if (
        elapsedTime > WAITING_TIME &&
        characterState !== 'Sit' &&
        characterState !== 'SitDown'
      ) {
        // If the character is waiting for some time, starts sitting movement
        setCharacterState('SitDown')
      } else if (
        elapsedTime > WAITING_TIME + 6 &&
        characterState === 'SitDown'
      ) {
        // After sitting animation is complete
        setCharacterState('Sit')
      }
    }

    //Update state with player's position
    setPlayerPosition(playerRef.current.translation())
  })

  return (
    <>
      <CameraControls ref={cameraRef} />

      <RigidBody
        colliders={false}
        gravityScale={GRAVITY_SCALE}
        canSleep={false}
        enabledRotations={[false, true, false]}
        ref={playerRef}
        position={[POSITION_X, POSITION_Y, POSITION_Z]}
        onCollisionEnter={(e) => {
          // Check if player is on the ground
          if (
            playerRef.current &&
            e.other.rigidBodyObject &&
            e.other.rigidBodyObject.name === 'terrain'
          ) {
            playerinTheAir.current = false
            playerLanded.current = true

            // Reset y speed
            const curVel = playerRef.current.linvel()
            curVel.y = 0

            playerRef.current.setLinvel(curVel, true)
          }
        }}
      >
        <group
          ref={cameraPosition}
          position-y={CAMERA_HEIGHT}
          position-z={-CAMERA_DISTANCE}
        />

        <group ref={characterRef}>
          <Maria position={[0, -0.85, 0]} />
        </group>

        <CapsuleCollider args={[0.65, 0.2]} />
      </RigidBody>
    </>
  )
}
