import { useEffect, useRef } from 'react'
import { Mesh, DoubleSide, Color, Vector3, ShaderMaterial } from 'three'
import { extend, GroupProps, ReactThreeFiber } from '@react-three/fiber'
import { shaderMaterial, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      groundMaterial: ReactThreeFiber.Node<
        typeof GroundMaterial & JSX.IntrinsicElements['shaderMaterial'],
        typeof GroundMaterial
      >
    }
  }
}

const GroundMaterial = shaderMaterial(
  {
    uLightPosition: settings.directionalLight.position,
    uLightColor: settings.directionalLight.color,
    uLightIntensity: settings.directionalLight.intensity,
    uGroundColor: new Vector3(),
    uGrassColor: new Vector3(),
    uSnowColor: new Vector3(),
    uRockColor: new Vector3(),
  },
  vertexShader,
  fragmentShader,
)

extend({ GroundMaterial })

export function Terrain(props: GroupProps) {
  const {
    GROUND_BASE_COLOR,
    GRASS_BASE_COLOR,
    ROCK_BASE_COLOR,
    SNOW_BASE_COLOR,
  } = useControls('Level', {
    GROUND_BASE_COLOR: { value: '#ffd89e', label: 'GROUND' }, //#ff9900
    GRASS_BASE_COLOR: { value: '#c1d19d', label: 'GRASS' }, // Default green color #5b8631
    ROCK_BASE_COLOR: { value: '#d8c6b9', label: 'ROCK' }, // Default rock-like color #654321
    SNOW_BASE_COLOR: { value: '#f1f1f1', label: 'SNOW' },
  })

  // Convert color hex values to three.js Color objects
  const GROUND_COLOR = new Color(GROUND_BASE_COLOR)
  const GRASS_COLOR = new Color(GRASS_BASE_COLOR)
  const ROCK_COLOR = new Color(ROCK_BASE_COLOR)
  const SNOW_COLOR = new Color(SNOW_BASE_COLOR)

  // Material
  const materialRef = useRef<ShaderMaterial & typeof GroundMaterial>(null)

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uGroundColor.value = GROUND_COLOR
    materialRef.current.uniforms.uGrassColor.value = GRASS_COLOR
    materialRef.current.uniforms.uSnowColor.value = SNOW_COLOR
    materialRef.current.uniforms.uRockColor.value = ROCK_COLOR
  }, [GROUND_COLOR, GRASS_COLOR, ROCK_COLOR, SNOW_COLOR])

  // Geometry
  const { nodes } = useGLTF('/models/terrain.glb')
  const plane = nodes.Plane as Mesh

  useEffect(() => {
    const positions = plane.geometry.attributes.position.array
    const colors = plane.geometry.attributes.color.array
    const vertexCount = positions.length / 3
    const heightMapSize = Math.ceil(Math.sqrt(vertexCount) * 0.7) // Multiply a factor to hide holes

    // Initialize heightData for a DataTexture (RGBA format)
    const heightData = new Float32Array(heightMapSize * heightMapSize * 4)

    // Get bounding box and calculate height normalization
    const boundingBox = plane.geometry.boundingBox

    if (!boundingBox) return

    const minHeight = boundingBox.min.y
    const maxHeight = boundingBox.max.y
    const heightRange = maxHeight - minHeight

    // Iterate through the geometry vertices
    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3] // X-coordinate
      const y = positions[i * 3 + 1] // Height
      const z = positions[i * 3 + 2] // Z-coordinate

      const r = colors[i * 3]
      const g = colors[i * 3 + 1]
      const b = colors[i * 3 + 2]

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
      const normalizedHeight = (y - minHeight) / heightRange
      heightData[index] = r // R
      heightData[index + 1] = g // G
      heightData[index + 2] = b // B
      heightData[index + 3] = normalizedHeight // A (We're use alpha channel to store the heightmap)
    }

    useStore.setState(() => ({
      terrainHeights: heightData,
      terrainHeightsMinMax: [minHeight, maxHeight],
      terrainSegments: heightMapSize,
    }))
  }, [plane.geometry])

  return (
    <group {...props} dispose={null} position={[0, 0, 0]}>
      <mesh geometry={plane.geometry}>
        <groundMaterial ref={materialRef} side={DoubleSide} vertexColors />
      </mesh>
    </group>
  )
}
