import { useEffect, useRef, useState } from 'react'
import { Vector3, MathUtils, Clock, Group, Vector2 } from 'three'
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

import { settings } from '~/config/settings'
import { Controls } from '~/config/controls'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

import { Maria } from './maria'
import { Shadow } from './shadow'
import { Camera } from './camera'

const START_POSITION = {
  start: { x: 109.6, y: 13, z: 79.57 },
  default: { x: 44.3, y: 8.5, z: 89.7 },
  rock: { x: 51.84, y: 6.5, z: -4.44 },
  water: { x: 73.35, y: 5, z: 120.64 },
  beach: { x: 73.14, y: 8, z: 106.9 },
  chest: { x: 109.8, y: 8, z: -119.3 },
  mountain: { x: -63.8, y: 35, z: -55.7 },
}

const START_ROTATION = {
  start: { x: 0, y: 0.9615808129310608, z: 0, w: -0.2745218873023987 },
  default: { x: 0, y: 0, z: 0, w: 0 },
}

const playerStartPosition = 'start'
const playerStartRotation = 'start'

type PlayerProps = {
  playerRef: React.RefObject<RapierRigidBody>
}

export const Player: React.FC<PlayerProps> = ({ playerRef }) => {
  const {
    FIXED,
    WALK_SPEED,
    RUN_SPEED,
    ROTATION_SPEED,
    JUMP_FORCE,
    GRAVITY_SCALE,
    WAITING_TIME,
    MOUSE_VEL_THRESHOLD,
    MOUSE_Y_THRESHOLD,
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
    MOUSE_VEL_THRESHOLD: { value: 0.1, min: 0.01, max: 0.8, step: 0.1 },
    MOUSE_Y_THRESHOLD: { value: 0.4, min: 0.1, max: 0.8, step: 0.1 },

    POSITION_X: {
      value: START_POSITION[playerStartPosition].x,
      min: -1000,
      max: 1000,
      step: 0.5,
    },
    POSITION_Y: {
      value: START_POSITION[playerStartPosition].y,
      min: -1000,
      max: 1000,
      step: 0.5,
    },
    POSITION_Z: {
      value: START_POSITION[playerStartPosition].z,
      min: -1000,
      max: 1000,
      step: 0.5,
    },
  })

  // Start Rotation
  const startRotation = euler().setFromQuaternion(
    quat(START_ROTATION[playerStartRotation]),
  )
  const customClock = useRef(new Clock())

  const rotVel = new Vector3()
  const mouseVel = new Vector2()
  const newPointer = new Vector2()
  const vel = useRef(new Vector3())
  const curVel = useRef(new Vector3())
  const playerinTheAir = useRef(true)
  const playerLanded = useRef(false)
  const playerLastJump = useRef(0)

  //const playerRef = useRef<RapierRigidBody>(null) // Rigid Body reference
  const characterRef = useRef<Group>(null) // 3D models reference

  const movement = useRef({
    x: 1,
    z: 0,
    w: 0, // used to store whether the player is moving forwards or backwards
  })

  const lastElapsedTime = useRef(0)

  const terrainLoaded = useStore((state) => state.terrainLoaded)
  const characterState = useStore((state) => state.characterState)
  const status = useStore((state) => state.status)
  const setCharacterState = useStore((state) => state.setCharacterState)
  const setCollected = useStore((state) => state.setCollected)

  const lastPlayerAudioPlayed = useAudio((state) => state.lastPlayerAudioPlayed)
  const setPlayerAudioToPlay = useAudio((state) => state.setPlayerAudioToPlay)
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  const [, get] = useKeyboardControls()
  const isClicking = useRef(false)

  const [releasePlayer, setReleasePlayer] = useState(false)

  // Release player to start moving
  useEffect(() => {
    if (status === 'wait' || status === 'loading') return

    const delayPlayer = setTimeout(() => setReleasePlayer(true), 1000)
    return () => {
      clearTimeout(delayPlayer)
    }
  }, [status])

  // Enable control by mouse or touch events
  useEffect(() => {
    const onMouseDown = () => {
      isClicking.current = true
    }
    const onMouseUp = () => {
      isClicking.current = false
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)

    // touch
    document.addEventListener('touchstart', onMouseDown)
    document.addEventListener('touchend', onMouseUp)

    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchstart', onMouseDown)
      document.removeEventListener('touchend', onMouseUp)
    }
  }, [])

  useFrame(({ clock, pointer }) => {
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
    mouseVel.set(0, 0)
    rotVel.set(0, 0, 0)
    vel.current.set(0, 0, 0)
    newPointer.set(0, 0)

    // This reference is used to store whether the player is moving forwards or backwards
    movement.current.w = 0

    // Store current velocity
    curVel.current = vec3(playerRef.current.linvel())

    if (isClicking.current) {
      newPointer.y = Math.pow(Math.min(pointer.y * 2, 1), 3) + MOUSE_Y_THRESHOLD
      newPointer.x = Math.pow(pointer.x, 3)

      if (Math.abs(newPointer.x) > MOUSE_VEL_THRESHOLD)
        mouseVel.x = -newPointer.x
      if (Math.abs(newPointer.y) > MOUSE_VEL_THRESHOLD)
        mouseVel.y = newPointer.y
    }

    // If the player is running
    const MOVEMENT_SPEED =
      get()[Controls.run] || isClicking.current ? RUN_SPEED : WALK_SPEED

    // Moving forward
    if (get()[Controls.forward] || mouseVel.y > MOUSE_VEL_THRESHOLD) {
      vel.current.z += MOVEMENT_SPEED

      movement.current.x = 1
      movement.current.w = 1 // Moving forwards or backwards

      // Make movement smoother with mouse
      if (isClicking.current) vel.current.z *= Math.abs(newPointer.y) * 0.4

      // Player is facing away from the camera
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        0,
        0.3,
      )
    }
    if (get()[Controls.backward] || mouseVel.y < -MOUSE_VEL_THRESHOLD) {
      vel.current.z -= MOVEMENT_SPEED

      movement.current.x = -1
      movement.current.w = 1 // Moving forwards or backwards

      // Make movement smoother with mouse
      if (isClicking.current) vel.current.z *= Math.abs(newPointer.y) * 0.4

      // Player facing the camera
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        Math.PI,
        0.3,
      )
    }

    // Enable the player to rotate without any lateral movement
    const isMovingZ = Math.abs(vel.current.z) >= MOVEMENT_SPEED

    if (get()[Controls.left] || mouseVel.x > MOUSE_VEL_THRESHOLD) {
      if (!isMovingZ) vel.current.z += MOVEMENT_SPEED * 0.5 * movement.current.x

      rotVel.y += ROTATION_SPEED * movement.current.x

      // Make movement smoother with mouse
      if (isClicking.current && newPointer.x) rotVel.y *= Math.abs(newPointer.x)
    }
    if (get()[Controls.right] || mouseVel.x < -MOUSE_VEL_THRESHOLD) {
      if (!isMovingZ) vel.current.z += MOVEMENT_SPEED * 0.5 * movement.current.x

      rotVel.y -= ROTATION_SPEED * movement.current.x

      // Make movement smoother with mouse
      if (isClicking.current && newPointer.x) rotVel.y *= Math.abs(newPointer.x)
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
    const playerY = playerRef.current?.translation().y

    // Player animations
    if (playerinTheAir.current === true) {
      // If the player is in the air, it means the player is jumping
      if (characterState !== 'Jump') {
        setCharacterState('Jump')
        setPlayerAudioToPlay(null)
      }
    } else if (
      (Math.abs(vel.current.x) > WALK_SPEED ||
        Math.abs(vel.current.z) > WALK_SPEED) &&
      movement.current.w === 1
    ) {
      // Player is walking if it has a high horizontal velocity and the movement w is 1
      customClock.current.start() // Reset counting
      if (characterState !== 'Run') {
        setCharacterState('Run')
        if (lastPlayerAudioPlayed !== 'running') setPlayerAudioToPlay('running')
      }
    } else if (
      Math.abs(vel.current.x) > 0.05 ||
      Math.abs(vel.current.z) > 0.05
    ) {
      // Player needs to have a minimum horizontal speed to start walking
      customClock.current.start() // Reset counting
      if (characterState !== 'Walk') {
        setCharacterState('Walk')
        if (lastPlayerAudioPlayed !== 'walking') setPlayerAudioToPlay('walking')
      }
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
        setPlayerAudioToPlay(null)
      } else if (
        elapsedTime > WAITING_TIME &&
        characterState !== 'Sit' &&
        characterState !== 'SitDown' &&
        playerY > settings.waterHeight + 1
      ) {
        // If the character is waiting for some time, starts sitting movement
        setCharacterState('SitDown')
        setPlayerAudioToPlay(null)
      } else if (
        elapsedTime > WAITING_TIME + 6 &&
        characterState === 'SitDown' &&
        playerY > settings.waterHeight + 1
      ) {
        // After sitting animation is complete plays a sort of sitting idle animation
        setCharacterState('Sit')
        setPlayerAudioToPlay('yawning')
      }
    }

    //Update last elapsed time
    lastElapsedTime.current = Math.floor(generalElapsedTime * 10)

    //console.log(playerRef.current.translation())
    //console.log(playerRef.current.rotation())
  })

  // Wait for the terrain to be loaded before placing the player
  return (
    terrainLoaded && (
      <>
        <RigidBody
          colliders={false}
          gravityScale={GRAVITY_SCALE}
          canSleep={false}
          enabledRotations={[false, true, false]}
          ref={playerRef}
          position={[POSITION_X, POSITION_Y, POSITION_Z]}
          rotation={startRotation}
          type={FIXED || !releasePlayer ? 'fixed' : 'dynamic'}
          collisionGroups={settings.groupPlayer}
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
              if (instanceId !== undefined) {
                setCollected(instanceId)
                setAudioToPlay('pop')
              }
            }
          }}
        >
          <group ref={characterRef}>
            <Maria position={[0, -0.85, 0]} />
          </group>

          <CapsuleCollider args={[0.65, 0.2]} />
        </RigidBody>

        <Shadow playerRef={characterRef} />
        <Camera playerRef={playerRef} />
      </>
    )
  )
}

