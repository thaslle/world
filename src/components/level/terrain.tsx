import { useEffect } from 'react'
import { Mesh } from 'three'
import { GroupProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'

import { useStore } from '~/hooks/use-store'

export function Terrain(props: GroupProps) {
  const { COLOR } = useControls('Ground', {
    COLOR: '#6fad1b',
  })

  const { nodes } = useGLTF('/models/terrain.gltf')
  const plane = nodes.Plane as Mesh

  useEffect(() => {
    const positions = plane.geometry.attributes.position.array
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
      heightData[index] = normalizedHeight // R
      heightData[index + 1] = normalizedHeight // G
      heightData[index + 2] = normalizedHeight // B
      heightData[index + 3] = normalizedHeight // A (We're currently using only alpha channel)
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
        <meshStandardMaterial color={COLOR} />
      </mesh>
    </group>
  )
}
