// This code is based on Bruno Simon's Infinite World
// https://github.com/brunosimon/infinite-world

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { extend, ReactThreeFiber, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { useControls } from 'leva'

import { useStore } from '~/hooks/use-store'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      grassMaterial: ReactThreeFiber.Node<
        typeof GrassMaterial & JSX.IntrinsicElements['shaderMaterial'],
        typeof GrassMaterial
      >
    }
  }
}

const GrassMaterial = shaderMaterial(
  {
    uTime: 0,
    uGrassDistance: 0,
    uPlayerPosition: new THREE.Vector3(0.0, 0.0, 0.0),
    uTerrainSize: 0,
    uTerrainTextureSize: 0,
    uTerrainTexture: null,
    uTerrainOffset: new THREE.Vector3(),
    uTerrainHeightMax: 0,
    uColor: new THREE.Vector3(),
  },
  vertexShader,
  fragmentShader,
)

extend({ GrassMaterial })

export const Grass = () => {
  const {
    playerPosition,
    terrainSize,
    terrainHeights,
    terrainHeightsMax,
    terrainSegments,
  } = useStore()

  const {
    DETAILS,
    SIZE,
    COUNT,
    BLADE_WIDTH_RATIO,
    BLADE_HEIGHT_RATIO,
    BLADE_HEIGHT_RANDOMNESS,
    POSITION_RANDOMNESS,
    TERRAIN_OFFSET,
    GRASS_BASE_COLOR,
  } = useControls('Grass', {
    DETAILS: { value: 290, min: 10, max: 2000, step: 1 },
    SIZE: { value: 26.0, min: 0.1, max: 100.0, step: 0.1 },
    COUNT: { value: 150000, min: 100, max: 150000, step: 10 },
    BLADE_WIDTH_RATIO: { value: 2.0, min: 0.1, max: 10.0, step: 0.1 },
    BLADE_HEIGHT_RATIO: { value: 3.0, min: 0.1, max: 10.0, step: 0.1 },
    BLADE_HEIGHT_RANDOMNESS: { value: 0.8, min: 0.1, max: 5.0, step: 0.1 },
    POSITION_RANDOMNESS: { value: 1.1, min: 0.1, max: 5.0, step: 0.1 },
    TERRAIN_OFFSET: { value: 820.0, min: -1000.0, max: 1000.0, step: 10.0 },
    GRASS_BASE_COLOR: { value: '#d6e29c', label: 'GRASS' },
  })

  const GRASS_COLOR = new THREE.Color(GRASS_BASE_COLOR)

  const geometryRef = useRef(new THREE.BufferGeometry())
  const materialRef = useRef<THREE.ShaderMaterial & typeof GrassMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uColor.value = GRASS_COLOR
  }, [GRASS_COLOR])

  const { centers, positions } = useMemo(() => {
    const centers = new Float32Array(COUNT * 3 * 2)
    const positions = new Float32Array(COUNT * 3 * 3)

    const FRAGMENT_SIZE = SIZE / DETAILS

    for (let iX = 0; iX < DETAILS; iX++) {
      const fragmentX = (iX / DETAILS - 0.5) * SIZE + FRAGMENT_SIZE * 0.5

      for (let iZ = 0; iZ < DETAILS; iZ++) {
        const fragmentZ = (iZ / DETAILS - 0.5) * SIZE + FRAGMENT_SIZE * 0.5

        const iStride9 = (iX * DETAILS + iZ) * 9
        const iStride6 = (iX * DETAILS + iZ) * 6

        // Center (for blade rotation)
        const centerX =
          fragmentX +
          (Math.random() - 0.5) * FRAGMENT_SIZE * POSITION_RANDOMNESS
        const centerZ =
          fragmentZ +
          (Math.random() - 0.5) * FRAGMENT_SIZE * POSITION_RANDOMNESS

        centers[iStride6] = centerX
        centers[iStride6 + 1] = centerZ

        centers[iStride6 + 2] = centerX
        centers[iStride6 + 3] = centerZ

        centers[iStride6 + 4] = centerX
        centers[iStride6 + 5] = centerZ

        // Position
        const bladeWidth = FRAGMENT_SIZE * BLADE_WIDTH_RATIO
        const bladeHalfWidth = bladeWidth * 0.5
        const bladeHeight =
          FRAGMENT_SIZE *
          BLADE_HEIGHT_RATIO *
          (1 -
            BLADE_HEIGHT_RANDOMNESS +
            Math.random() * BLADE_HEIGHT_RANDOMNESS)

        positions[iStride9] = -bladeHalfWidth
        positions[iStride9 + 1] = 0
        positions[iStride9 + 2] = 0

        positions[iStride9 + 3] = 0
        positions[iStride9 + 4] = bladeHeight
        positions[iStride9 + 5] = 0

        positions[iStride9 + 6] = bladeHalfWidth
        positions[iStride9 + 7] = 0
        positions[iStride9 + 8] = 0
      }
    }

    return { centers, positions }
  }, [
    COUNT,
    SIZE,
    DETAILS,
    TERRAIN_OFFSET,
    POSITION_RANDOMNESS,
    BLADE_WIDTH_RATIO,
    BLADE_HEIGHT_RATIO,
    BLADE_HEIGHT_RANDOMNESS,
  ])

  useEffect(() => {
    if (!geometryRef.current || !materialRef.current) return

    // Update geometry with the blades attributes
    geometryRef.current.setAttribute(
      'center',
      new THREE.Float32BufferAttribute(centers, 2),
    )
    geometryRef.current.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )

    // Pass the size properties to the shader
    materialRef.current.uniforms.uGrassDistance.value = SIZE
    materialRef.current.uniforms.uTerrainOffset.value = new THREE.Vector3(
      TERRAIN_OFFSET,
      0.0,
      TERRAIN_OFFSET,
    )
  }, [centers, positions])

  useEffect(() => {
    if (
      terrainHeights &&
      terrainSize &&
      terrainHeightsMax &&
      materialRef.current
    ) {
      const dataTexture = new THREE.DataTexture(
        terrainHeights,
        terrainSegments,
        terrainSegments,
        THREE.RGBAFormat,
        THREE.FloatType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.LinearFilter,
        THREE.LinearFilter,
      )
      dataTexture.needsUpdate = true
      dataTexture.flipY = false

      materialRef.current.uniforms.uTerrainTexture.value = dataTexture
      materialRef.current.uniforms.uTerrainSize.value = terrainSize
      materialRef.current.uniforms.uTerrainTextureSize.value = terrainSize
      materialRef.current.uniforms.uTerrainHeightMax.value = terrainHeightsMax
    }
  }, [terrainHeights, terrainHeightsMax, terrainSegments, terrainSize])

  //Update Positions
  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current || !playerPosition) return

    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()

    // Update mesh position (y has to be always 0)
    meshRef.current.position.set(playerPosition.x, 0, playerPosition.z)

    // Update player position
    materialRef.current.uniforms.uPlayerPosition.value.set(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z,
    )
  })

  return (
    <mesh frustumCulled={false} ref={meshRef} receiveShadow>
      <bufferGeometry ref={geometryRef} />
      <grassMaterial ref={materialRef} />
    </mesh>
  )
}

