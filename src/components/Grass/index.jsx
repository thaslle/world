import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { useControls } from "leva";

import { useStore } from "../../hooks/useStore";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// const DETAILS = 50;
// const SIZE = 1;
// const COUNT = 2500;
// const FRAGMENT_SIZE = SIZE / DETAILS;
// const BLADE_WIDTH_RATIO = 1;
// const BLADE_HEIGHT_RATIO = 2;
// const BLADE_HEIGHT_RANDOMNESS = 0.5;
// const POSITION_RANDOMNESS = 0.5;

export const Grass = () => {
  const playerPosition = useStore((state) => state.playerPosition);

  const {
    DETAILS,
    SIZE,
    COUNT,
    BLADE_WIDTH_RATIO,
    BLADE_HEIGHT_RATIO,
    BLADE_HEIGHT_RANDOMNESS,
    POSITION_RANDOMNESS,
  } = useControls("Grass", {
    DETAILS: { value: 95, min: 10, max: 200, step: 1 },
    SIZE: { value: 9.0, min: 0.1, max: 100.0, step: 0.1 },
    COUNT: { value: 9500, min: 100, max: 15000, step: 10 },
    BLADE_WIDTH_RATIO: { value: 1.9, min: 0.1, max: 10.0, step: 0.1 },
    BLADE_HEIGHT_RATIO: { value: 3.2, min: 0.1, max: 10.0, step: 0.1 },
    BLADE_HEIGHT_RANDOMNESS: { value: 0.7, min: 0.1, max: 5.0, step: 0.1 },
    POSITION_RANDOMNESS: { value: 0.7, min: 0.1, max: 5.0, step: 0.1 },
  });

  const { centers, positions } = useMemo(() => {
    const centers = new Float32Array(COUNT * 3 * 2);
    const positions = new Float32Array(COUNT * 3 * 3);

    const FRAGMENT_SIZE = SIZE / DETAILS;

    const GrassMaterial = shaderMaterial(
      {
        uTime: 0,
        uGrassDistance: SIZE,
        uPlayerPosition: new THREE.Vector3(0.0, 0.0, 0.0),
        uTerrainSize: SIZE,
        uTerrainTextureSize: SIZE,
        uTerrainATexture: null,
        uTerrainAOffset: new THREE.Vector2(),
        uTerrainBTexture: null,
        uTerrainBOffset: new THREE.Vector2(),
        uTerrainCTexture: null,
        uTerrainCOffset: new THREE.Vector2(),
        uTerrainDTexture: null,
        uTerrainDOffset: new THREE.Vector2(),
        uFresnelOffset: 0,
        uFresnelScale: 0.5,
        uFresnelPower: 2,
        uSunPosition: new THREE.Vector3(-0.5, -0.5, -0.5),
      },
      vertexShader,
      fragmentShader,
    );

    // declaratively
    extend({ GrassMaterial });

    for (let iX = 0; iX < DETAILS; iX++) {
      const fragmentX = (iX / DETAILS - 0.5) * SIZE + FRAGMENT_SIZE * 0.5;

      for (let iZ = 0; iZ < DETAILS; iZ++) {
        const fragmentZ = (iZ / DETAILS - 0.5) * SIZE + FRAGMENT_SIZE * 0.5;

        const iStride9 = (iX * DETAILS + iZ) * 9;
        const iStride6 = (iX * DETAILS + iZ) * 6;

        // Center (for blade rotation)
        const centerX =
          fragmentX +
          (Math.random() - 0.5) * FRAGMENT_SIZE * POSITION_RANDOMNESS;
        const centerZ =
          fragmentZ +
          (Math.random() - 0.5) * FRAGMENT_SIZE * POSITION_RANDOMNESS;

        centers[iStride6] = centerX;
        centers[iStride6 + 1] = centerZ;

        centers[iStride6 + 2] = centerX;
        centers[iStride6 + 3] = centerZ;

        centers[iStride6 + 4] = centerX;
        centers[iStride6 + 5] = centerZ;

        // Position
        const bladeWidth = FRAGMENT_SIZE * BLADE_WIDTH_RATIO;
        const bladeHalfWidth = bladeWidth * 0.5;
        const bladeHeight =
          FRAGMENT_SIZE *
          BLADE_HEIGHT_RATIO *
          (1 -
            BLADE_HEIGHT_RANDOMNESS +
            Math.random() * BLADE_HEIGHT_RANDOMNESS);

        positions[iStride9] = -bladeHalfWidth;
        positions[iStride9 + 1] = 0;
        positions[iStride9 + 2] = 0;

        positions[iStride9 + 3] = 0;
        positions[iStride9 + 4] = bladeHeight;
        positions[iStride9 + 5] = 0;

        positions[iStride9 + 6] = bladeHalfWidth;
        positions[iStride9 + 7] = 0;
        positions[iStride9 + 8] = 0;
      }
    }

    return { centers, positions };
  }, [
    DETAILS,
    SIZE,
    COUNT,
    BLADE_WIDTH_RATIO,
    BLADE_HEIGHT_RATIO,
    BLADE_HEIGHT_RANDOMNESS,
    POSITION_RANDOMNESS,
  ]);

  const geometryRef = useRef(new THREE.BufferGeometry());
  const materialRef = useRef();
  const meshRef = useRef();

  useEffect(() => {
    if (!geometryRef.current) return;

    geometryRef.current.setAttribute(
      "center",
      new THREE.Float32BufferAttribute(centers, 2),
    );
    geometryRef.current.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
  }, [centers, positions]);

  //Update Positions
  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current || !playerPosition) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    //this.material.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)

    meshRef.current.position.set(playerPosition.x, 0, playerPosition.z);

    materialRef.current.uniforms.uPlayerPosition.value.set(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z,
    );
  });

  return (
    <mesh frustumCulled={false} ref={meshRef}>
      <bufferGeometry ref={geometryRef} />
      <grassMaterial ref={materialRef} />
    </mesh>
  );
};
