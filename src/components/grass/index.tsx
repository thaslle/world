// This code is based on Bruno Simon's Infinite World
// https://github.com/brunosimon/infinite-world

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { useControls } from 'leva'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

type GrassProps = {
  playerRef: React.RefObject<RapierRigidBody>
}

export const Grass: React.FC<GrassProps> = ({ playerRef }) => {
  const { terrainSize, terrainHeights, terrainHeightsMax, terrainSegments } =
    useStore()

  const [shaderLoaded, setShaderLoaded] = useState(false)

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
    DETAILS: { value: 300, min: 10, max: 2000, step: 1 },
    SIZE: { value: 50.0, min: 0.1, max: 100.0, step: 0.1 },
    COUNT: { value: 200000, min: 100, max: 200000, step: 10 },
    BLADE_WIDTH_RATIO: { value: 1.4, min: 0.1, max: 10.0, step: 0.1 },
    BLADE_HEIGHT_RATIO: { value: 2.2, min: 0.1, max: 10.0, step: 0.1 },
    BLADE_HEIGHT_RANDOMNESS: { value: 0.7, min: 0.1, max: 5.0, step: 0.1 },
    POSITION_RANDOMNESS: { value: 0.7, min: 0.1, max: 5.0, step: 0.1 },
    TERRAIN_OFFSET: { value: 1000.0, min: -1000.0, max: 1000.0, step: 10.0 },
    GRASS_BASE_COLOR: { value: '#778a2b', label: 'GRASS' }, //d6e29c
  })

  const GRASS_COLOR = new THREE.Color(GRASS_BASE_COLOR)

  const geometryRef = useRef(new THREE.BufferGeometry())
  const meshRef = useRef<THREE.Mesh>(null)

  const materialRef = useRef(
    new THREE.MeshLambertMaterial({
      color: GRASS_COLOR,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    }),
  )

  useEffect(() => {
    if (materialRef.current)
      materialRef.current.userData = materialRef.current.userData || {}
  }, [])

  materialRef.current.onBeforeCompile = (shader) => {
    materialRef.current.userData.shader = shader

    // Reload shader in all dependecies
    setShaderLoaded(true)

    // Declare the new uniform
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uGrassDistance = { value: 0 }
    shader.uniforms.uPlayerPosition = {
      value: new THREE.Vector3(0.0, 0.0, 0.0),
    }
    shader.uniforms.uTerrainSize = { value: 0 }
    shader.uniforms.uTerrainTextureSize = { value: 0 }
    shader.uniforms.uTerrainTexture = { value: null }
    shader.uniforms.uTerrainOffset = { value: new THREE.Vector3() }
    shader.uniforms.uTerrainHeightMax = { value: 0 }
    shader.uniforms.uColor = { value: new THREE.Vector3() }
    shader.uniforms.uLightPosition = {
      value: settings.directionalLight.position,
    }

    shader.vertexShader = vertexShader
    shader.fragmentShader = fragmentShader
  }

  useEffect(() => {
    if (materialRef.current)
      materialRef.current.userData = materialRef.current.userData || {}

    if (!materialRef.current.userData.shader) return
    materialRef.current.color = GRASS_COLOR
    materialRef.current.userData.shader.uniforms.uColor.value = GRASS_COLOR
  }, [GRASS_COLOR, shaderLoaded])

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
    if (materialRef.current)
      materialRef.current.userData = materialRef.current.userData || {}

    if (
      !geometryRef.current ||
      !materialRef.current ||
      !materialRef.current.userData.shader
    )
      return

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
    materialRef.current.userData.shader.uniforms.uGrassDistance.value = SIZE
    materialRef.current.userData.shader.uniforms.uTerrainOffset.value =
      new THREE.Vector3(TERRAIN_OFFSET, 0.0, TERRAIN_OFFSET)
  }, [centers, positions, shaderLoaded])

  useEffect(() => {
    if (materialRef.current)
      materialRef.current.userData = materialRef.current.userData || {}

    if (
      !terrainHeights ||
      !terrainSize ||
      !terrainHeightsMax ||
      !materialRef.current
    )
      return

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

    if (!materialRef.current.userData.shader) return

    materialRef.current.userData.shader.uniforms.uTerrainTexture.value =
      dataTexture
    materialRef.current.userData.shader.uniforms.uTerrainSize.value =
      terrainSize
    materialRef.current.userData.shader.uniforms.uTerrainTextureSize.value =
      terrainSize
    materialRef.current.userData.shader.uniforms.uTerrainHeightMax.value =
      terrainHeightsMax
  }, [
    terrainHeights,
    terrainHeightsMax,
    terrainSegments,
    terrainSize,
    shaderLoaded,
  ])

  //Update Positions
  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current || !playerRef.current) return

    const playerPosition = playerRef.current.translation()

    // Update mesh position (y has to be always 0)
    meshRef.current.position.set(playerPosition.x, 0, playerPosition.z)

    // Update player position
    if (!materialRef.current.userData.shader) return
    materialRef.current.userData.shader.uniforms.uTime.value =
      clock.getElapsedTime()

    materialRef.current.userData.shader.uniforms.uPlayerPosition.value.set(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z,
    )
  })

  return (
    <mesh
      frustumCulled={false}
      ref={meshRef}
      receiveShadow
      material={materialRef.current}
    >
      <bufferGeometry ref={geometryRef} />
    </mesh>
  )
}

