import { useRef } from 'react'
import { Vector3, MathUtils, Clock, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
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
import { Shadow } from './shadow'
import { Camera } from './camera'

export const Player = () => {
  const {
    FIXED,
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
    FIXED: { value: false },
    WALK_SPEED: { value: 2.0, min: 0.1, max: 8.0, step: 0.1 },
    RUN_SPEED: { value: 6.0, min: 0.2, max: 30, step: 0.1 },
    ROTATION_SPEED: { value: 2.5, min: 0.2, max: 12, step: 0.1 },
    JUMP_FORCE: { value: 3.8, min: 0.2, max: 12, step: 0.1 },
    GRAVITY_SCALE: { value: 1.5, min: 0.2, max: 12, step: 0.1 },
    WAITING_TIME: { value: 10.0, min: 0.1, max: 30, step: 0.1 },

    POSITION_X: { value: 44.3, min: -1000, max: 1000, step: 0.5 },
    POSITION_Y: { value: 7, min: -1000, max: 1000, step: 0.5 },
    POSITION_Z: { value: 89.17, min: -1000, max: 1000, step: 0.5 },

    // POSITION_X: { value: 73.35, min: -1000, max: 1000, step: 0.5 },
    // POSITION_Y: { value: 2.59, min: -1000, max: 1000, step: 0.5 },
    // POSITION_Z: { value: 120.64, min: -1000, max: 1000, step: 0.5 },
  })

  const customClock = useRef(new Clock())

  const rotVel = new Vector3()
  const vel = useRef(new Vector3())
  const curVel = useRef(new Vector3())
  const playerinTheAir = useRef(true)
  const playerLanded = useRef(false)
  const playerLastJump = useRef(0)

  const playerRef = useRef<RapierRigidBody>(null) // Rigid Body reference
  const characterRef = useRef<Group>(null) // 3D models reference

  const movement = useRef({
    x: 1,
    z: 0,
    w: 0, // used to store whether the player is moving forwards or backwards
  })

  const lastElapsedTime = useRef(0)

  const characterState = useStore((state) => state.characterState)
  const setCharacterState = useStore((state) => state.setCharacterState)
  const setCollected = useStore((state) => state.setCollected)

  const [, get] = useKeyboardControls()

  useFrame(({ clock }) => {
    if (
      !playerRef.current ||
      !characterRef.current ||
      !customClock.current ||
      !curVel.current ||
      !vel.current
    )
      return

    // Clock functions
    const elapsedTime = customClock.current.getElapsedTime()
    const generalElapsedTime = clock.getElapsedTime()

    // Clean the movement variables
    rotVel.x = 0
    rotVel.y = 0
    rotVel.z = 0

    vel.current.x = 0
    vel.current.y = 0
    vel.current.z = 0

    // This reference is used to store whether the player is moving forwards or backwards
    movement.current.w = 0

    // Store current velocity
    curVel.current = vec3(playerRef.current.linvel())

    // If the player is running
    const MOVEMENT_SPEED = get()[Controls.run] ? RUN_SPEED : WALK_SPEED

    // Moving forward
    if (get()[Controls.forward]) {
      vel.current.z += MOVEMENT_SPEED

      movement.current.x = 1
      movement.current.w = 1 // Moving forwards or backwards

      // Player is facing away from the camera
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        0,
        0.3,
      )
    }
    if (get()[Controls.backward]) {
      vel.current.z -= MOVEMENT_SPEED

      movement.current.x = -1
      movement.current.w = 1 // Moving forwards or backwards

      // Player facing the camera
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        Math.PI,
        0.3,
      )
    }

    // Enable the player to rotate without any lateral movement
    const isMovingZ = Math.abs(vel.current.z) >= MOVEMENT_SPEED

    if (get()[Controls.left]) {
      if (!isMovingZ) vel.current.z += MOVEMENT_SPEED * 0.5 * movement.current.x

      rotVel.y += ROTATION_SPEED * movement.current.x
    }
    if (get()[Controls.right]) {
      if (!isMovingZ) vel.current.z += MOVEMENT_SPEED * 0.5 * movement.current.x

      rotVel.y -= ROTATION_SPEED * movement.current.x
    }

    playerRef.current.setAngvel(rotVel, true)

    // Apply rotation to x and z to go in the right direction
    const eulerRot = euler().setFromQuaternion(
      quat(playerRef.current.rotation()),
    )

    vel.current.applyEuler(eulerRot)

    // Allow the character to jump if it isn't currently in the air
    if (
      get()[Controls.jump] &&
      !playerinTheAir.current &&
      playerLanded.current &&
      generalElapsedTime - playerLastJump.current > 0.8
    ) {
      vel.current.y += JUMP_FORCE
      playerinTheAir.current = true
      playerLanded.current = false
      playerLastJump.current = generalElapsedTime
    } else {
      vel.current.y = curVel.current.y
    }

    // Apply Velocity
    playerRef.current.setLinvel(vel.current, true)

    // Player animations
    if (playerinTheAir.current === true) {
      // If the player is in the air, it means the player is jumping
      if (characterState !== 'Jump') setCharacterState('Jump')
    } else if (
      (Math.abs(vel.current.x) > WALK_SPEED ||
        Math.abs(vel.current.z) > WALK_SPEED) &&
      movement.current.w === 1
    ) {
      // Player is walking if it has a high horizontal velocity and the movement w is 1
      customClock.current.start() // Reset counting
      if (characterState !== 'Run') setCharacterState('Run')
    } else if (
      Math.abs(vel.current.x) > 0.05 ||
      Math.abs(vel.current.z) > 0.05
    ) {
      // Player needs to have a minimum horizontal speed to start walking
      customClock.current.start() // Reset counting
      if (characterState !== 'Walk') setCharacterState('Walk')
    } else {
      // Logics for when the player is not moving
      if (
        characterState !== 'Idle' &&
        characterState !== 'Sit' &&
        characterState !== 'StandUp' &&
        characterState !== 'SitDown'
      ) {
        // Set a default Idle state if player doesn't have any state
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
        // After sitting animation is complete plays a sort of sitting idle animation
        setCharacterState('Sit')
      }
    }

    //Update last elapsed time
    lastElapsedTime.current = Math.floor(generalElapsedTime * 10)

    //console.log(playerRef.current.translation())

    useStore.setState(() => ({
      playerPosition: playerRef.current?.translation(),
    }))
  })

  return (
    <>
      <RigidBody
        colliders={false}
        gravityScale={GRAVITY_SCALE}
        canSleep={false}
        enabledRotations={[false, true, false]}
        ref={playerRef}
        position={[POSITION_X, POSITION_Y, POSITION_Z]}
        type={FIXED ? 'fixed' : 'dynamic'}
        name="player"
        onCollisionEnter={(e) => {
          // Check if player is on the ground
          if (
            playerRef.current &&
            e.other.rigidBodyObject?.name === 'terrain'
          ) {
            playerinTheAir.current = false
            playerLanded.current = true

            // Reset y speed
            curVel.current = vec3(playerRef.current.linvel())
            curVel.current.y = 0

            playerRef.current.setLinvel(curVel.current, true)
          }

          // Make the collectible disapear
          if (e.other.rigidBodyObject?.name === 'collectible') {
            const instanceId = e.other.rigidBodyObject.userData.id
            if (instanceId !== undefined) setCollected(instanceId)
          }
        }}
      >
        <Camera playerRef={playerRef} />

        <group ref={characterRef}>
          <Maria position={[0, -0.85, 0]} />
        </group>

        <CapsuleCollider args={[0.65, 0.2]} />
      </RigidBody>

      <Shadow playerRef={characterRef} />
    </>
  )
}

