import { useRef } from "react";
// import { useEffect, useRef, useState } from "react";
import { Vector3, MathUtils, Clock } from "three";
import { useFrame } from "@react-three/fiber";
import { CameraControls, useKeyboardControls } from "@react-three/drei";
import {
  CapsuleCollider,
  euler,
  quat,
  RigidBody,
  vec3,
} from "@react-three/rapier";
import { useControls } from "leva";

import { Controls } from "../../config/controls";
import { useStore } from "../../hooks/useStore";
import { Maria } from "./Maria";

export const Player = () => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED, JUMP_FORCE, WAITING_TIME } =
    useControls("Character", {
      WALK_SPEED: { value: 2.0, min: 0.1, max: 8.0, step: 0.1 },
      RUN_SPEED: { value: 5.0, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: { value: 2.5, min: 0.2, max: 12, step: 0.1 },
      JUMP_FORCE: { value: 8.0, min: 0.2, max: 12, step: 0.1 },
      WAITING_TIME: { value: 10.0, min: 0.1, max: 30, step: 0.1 },
    });

  const { CAMERA_DISTANCE, CAMERA_HEIGHT } = useControls("Camera", {
    CAMERA_DISTANCE: { value: 4.6, min: 0.1, max: 20.0, step: 0.1 },
    CAMERA_HEIGHT: { value: 1.0, min: 0.1, max: 20.0, step: 0.1 },
  });

  const customClock = useRef(new Clock());

  const vel = new Vector3();
  const inTheAir = useRef(true);
  const landed = useRef(false);

  const playerRef = useRef();
  const characterRef = useRef();
  const cameraRef = useRef();
  const movement = useRef({
    x: 1,
    z: 0,
    w: 0,
  });

  const cameraTarget = useRef(new Vector3(0, 0, 0));
  const cameraPosition = useRef(new Vector3(0, 0, 0));
  const positionWorldPosition = new Vector3();

  const characterState = useStore((state) => state.characterState);
  const setCharacterState = useStore((state) => state.setCharacterState);

  const [, get] = useKeyboardControls();

  useFrame(() => {
    if (
      !cameraRef.current ||
      !playerRef.current ||
      !characterRef.current ||
      !cameraTarget.current ||
      !cameraPosition.current ||
      !customClock.current
    )
      return;

    // Clock functions
    const elapsedTime = customClock.current.getElapsedTime();

    cameraTarget.current = vec3(playerRef.current.translation());
    cameraPosition.current.getWorldPosition(positionWorldPosition);

    // When player is Sit, you can rotate the camera around
    if (characterState !== "Sit") {
      cameraRef.current.setLookAt(
        positionWorldPosition.x,
        positionWorldPosition.y,
        positionWorldPosition.z,
        cameraTarget.current.x,
        cameraTarget.current.y,
        cameraTarget.current.z,
        true,
      );
    }

    let MOVEMENT_SPEED = get().run ? RUN_SPEED : WALK_SPEED;

    const rotVel = {
      x: 0,
      y: 0,
      z: 0,
    };

    const curVel = playerRef.current.linvel();
    vel.x = 0;
    vel.y = 0;
    vel.z = 0;
    movement.current.w = 0;

    if (get()[Controls.forward]) {
      vel.z += MOVEMENT_SPEED;
      movement.current.x = 1;
      movement.current.r = 0;
      movement.current.w = 1;

      //characterRef.current.rotation.set(0, 0, 0);
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        0,
        0.3,
      );
    }
    if (get()[Controls.backward]) {
      vel.z -= MOVEMENT_SPEED;
      movement.current.x = -1;
      movement.current.w = 1;

      //characterRef.current.rotation.set(0, Math.PI, 0);
      characterRef.current.rotation.y = MathUtils.lerp(
        characterRef.current.rotation.y,
        Math.PI,
        0.3,
      );
    }

    const isMovingZ = Math.abs(vel.z) >= MOVEMENT_SPEED;
    //const increaseRotation = isMovingZ ? 1 : 3;

    if (get()[Controls.left]) {
      if (!isMovingZ) vel.z += MOVEMENT_SPEED * 0.5 * movement.current.x;

      rotVel.y += ROTATION_SPEED * movement.current.x;
    }
    if (get()[Controls.right]) {
      if (!isMovingZ) vel.z += MOVEMENT_SPEED * 0.5 * movement.current.x;

      rotVel.y -= ROTATION_SPEED * movement.current.x;
    }

    playerRef.current.setAngvel(rotVel);

    // apply rotation to x and z to go in the right direction
    const eulerRot = euler().setFromQuaternion(
      quat(playerRef.current.rotation()),
    );

    vel.applyEuler(eulerRot);

    // Make the character jump (I'm not using it yet, but it'll be applied in the future)
    if (get()[Controls.jump] && !inTheAir.current && landed.current) {
      vel.y += JUMP_FORCE;
      inTheAir.current = true;
      landed.current = false;
    } else {
      vel.y = curVel.y;
    }

    if (Math.abs(vel.y) > 1) {
      inTheAir.current = true;
      landed.current = false;
    } else {
      inTheAir.current = false;
    }

    // Apply Velocity
    playerRef.current.setLinvel(vel);

    //Player animations
    if (
      (Math.abs(vel.x) > WALK_SPEED || Math.abs(vel.z) > WALK_SPEED) &&
      movement.current.w === 1
    ) {
      customClock.current.start();
      if (characterState !== "Run") setCharacterState("Run");
    } else if (Math.abs(vel.x) > 0.05 || Math.abs(vel.z) > 0.05) {
      customClock.current.start();
      if (characterState !== "Walk") setCharacterState("Walk");
    } else {
      if (
        characterState !== "Idle" &&
        characterState !== "Sit" &&
        characterState !== "StandUp" &&
        characterState !== "SitDown"
      ) {
        customClock.current.start();
        setCharacterState("Idle");
      } else if (
        elapsedTime > WAITING_TIME &&
        characterState !== "Sit" &&
        characterState !== "SitDown"
      ) {
        setCharacterState("SitDown");
      } else if (
        elapsedTime > WAITING_TIME + 6 &&
        characterState === "SitDown"
      ) {
        setCharacterState("Sit");
      }
    }

    //Update state
    useStore.setState(() => ({
      playerPosition: playerRef.current.translation(),
    }));
  });

  return (
    <>
      <CameraControls ref={cameraRef} />

      <RigidBody
        colliders={false}
        gravityScale={2.5}
        canSleep={false}
        enabledRotations={[false, true, false]}
        ref={playerRef}
        position={[0, 1.5, 0]}
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
  );
};
