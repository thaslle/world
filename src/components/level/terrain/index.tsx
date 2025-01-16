import { useEffect, useRef } from 'react'
import { Mesh, DoubleSide, Color, Vector3, MeshStandardMaterial } from 'three'
import { GroupProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'

import CustomShaderMaterial from 'three-custom-shader-material'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export function Terrain(props: GroupProps) {
  const {
    GROUND_BASE_COLOR,
    GRASS_BASE_COLOR,
    ROCK_BASE_COLOR,
    SNOW_BASE_COLOR,
    OCEAN_BASE_COLOR,
  } = useControls('Level', {
    GROUND_BASE_COLOR: { value: '#f5a733', label: 'GROUND' },
    GRASS_BASE_COLOR: { value: '#92ad39', label: 'GRASS' },
    ROCK_BASE_COLOR: { value: '#9d8371', label: 'ROCK' },
    SNOW_BASE_COLOR: { value: '#e8e8e8', label: 'SNOW' },
    OCEAN_BASE_COLOR: { value: '#badfe8', label: 'OCEAN' },
  })

  // Convert color hex values to three.js Color objects
  const GROUND_COLOR = new Color(GROUND_BASE_COLOR)
  const GRASS_COLOR = new Color(GRASS_BASE_COLOR)
  const ROCK_COLOR = new Color(ROCK_BASE_COLOR)
  const SNOW_COLOR = new Color(SNOW_BASE_COLOR)
  const OCEAN_COLOR = new Color(OCEAN_BASE_COLOR)

  // Material
  const materialRef = useRef<any>(null)

  // Update Ocean Color
  useEffect(() => {
    useStore.setState(() => ({
      oceanBaseColor: OCEAN_COLOR,
    }))
  }, [OCEAN_COLOR])

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uGroundColor.value = GROUND_COLOR
    materialRef.current.uniforms.uGrassColor.value = GRASS_COLOR
    materialRef.current.uniforms.uSnowColor.value = SNOW_COLOR
    materialRef.current.uniforms.uRockColor.value = ROCK_COLOR
    materialRef.current.uniforms.uOceanColor.value = OCEAN_COLOR
  }, [GROUND_COLOR, GRASS_COLOR, ROCK_COLOR, SNOW_COLOR, OCEAN_COLOR])

  // Geometry
  const { nodes } = useGLTF('/models/terrain.glb')
  const plane = nodes.Plane as Mesh

  useEffect(() => {
    const positions = plane.geometry.attributes.position.array
    const colors = plane.geometry.attributes.color.array

    const vertexCount = positions.length / 3
    const heightMapSize = Math.ceil(Math.sqrt(vertexCount))

    // Initialize heightData for a DataTexture (RGBA format)
    const heightData = new Float32Array(heightMapSize * heightMapSize * 4)

    // Get bounding box and calculate height normalization
    const boundingBox = plane.geometry.boundingBox

    if (!boundingBox) return

    const maxHeight = boundingBox.min.y + boundingBox.max.y

    // Iterate through the geometry vertices
    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3] // X-coordinate
      const y = positions[i * 3 + 1] // Height
      const z = positions[i * 3 + 2] // Z-coordinate

      const r = colors[i * 4]
      const g = colors[i * 4 + 1]
      const b = colors[i * 4 + 2]

      // Normalize X and Z to [0, 1] for grid mapping
      const normalizedX =
        (x - boundingBox.min.x) / (boundingBox.max.x - boundingBox.min.x)
      const normalizedZ =
        (z - boundingBox.min.z) / (boundingBox.max.z - boundingBox.min.z)

      // Determine row and column in the heightmap grid
      const col = Math.round(normalizedX * (heightMapSize - 1))
      const row = Math.round(normalizedZ * (heightMapSize - 1))

      // Calculate the flat array index
      const index = (row * heightMapSize + col) * 4

      // Normalize height to [0, 1] and assign to heightData
      const normalizedHeight = y / maxHeight
      heightData[index] = r // R
      heightData[index + 1] = g // G
      heightData[index + 2] = b // B
      heightData[index + 3] = normalizedHeight // A (We're use alpha channel to store the heightmap)
    }

    useStore.setState(() => ({
      terrainHeights: heightData,
      terrainHeightsMax: maxHeight,
      terrainSegments: heightMapSize,
    }))
  }, [plane.geometry])

  return (
    <group {...props} dispose={null} position={[0, 0, 0]}>
      <mesh geometry={plane.geometry} receiveShadow>
        <CustomShaderMaterial
          ref={materialRef}
          side={DoubleSide}
          vertexColors
          baseMaterial={MeshStandardMaterial}
          uniforms={{
            uLightPosition: { value: settings.directionalLight.position },
            uLightColor: { value: settings.directionalLight.color },
            uLightIntensity: { value: settings.directionalLight.intensity },
            uGroundColor: { value: new Vector3() },
            uGrassColor: { value: new Vector3() },
            uSnowColor: { value: new Vector3() },
            uRockColor: { value: new Vector3() },
            uOceanColor: { value: new Vector3() },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </group>
  )
}

