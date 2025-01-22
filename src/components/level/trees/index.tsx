import { useEffect, useRef } from 'react'
import { GroupProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, Object3D, InstancedMesh } from 'three'
import LeafMaterial from './material'

// Type for the Props of the Instances component
interface TreesProps extends GroupProps {
  count?: number
  temp?: Object3D
}

export const Trees: React.FC<TreesProps> = ({
  count = 10,
  temp = new Object3D(),
  ...props
}) => {
  // Refs for the instanced meshes
  const instancedTrunkRef = useRef<InstancedMesh>(null)
  const instancedFoliageRef = useRef<InstancedMesh>(null)

  const { nodes, materials } = useGLTF('/models/tree.glb')

  const leafMaterial = LeafMaterial()

  const trunkMaterial = new MeshStandardMaterial({
    map: (materials.trunk as MeshStandardMaterial).map,
  })

  useEffect(() => {
    if (!instancedTrunkRef.current || !instancedFoliageRef.current) return

    // Set positions for both the trunk and foliage instances
    for (let i = 0; i < count; i++) {
      // Randomize position for both trunk and foliage
      const x = Math.random() * 50
      const y = Math.random() * 10
      const z = Math.random() * 50

      const scale = Math.random() * (1.3 - 0.8) + 0.8

      // Set the trunk position
      temp.position.set(x, y, z)
      temp.rotation.set(0, Math.PI * y, 0)
      temp.scale.set(scale, scale, scale)
      temp.updateMatrix()
      instancedTrunkRef.current.setMatrixAt(i, temp.matrix)

      // Set the foliage position with an offset on the y-axis to make it appear above the trunk
      temp.position.set(x, y + 2, z) // Foliage slightly higher
      temp.rotation.set(0, Math.PI * y, 0)
      temp.scale.set(scale, scale, scale)
      temp.updateMatrix()
      instancedFoliageRef.current.setMatrixAt(i, temp.matrix)
    }

    // Update the instance matrices
    instancedTrunkRef.current.instanceMatrix.needsUpdate = true
    instancedFoliageRef.current.instanceMatrix.needsUpdate = true
  }, [count, temp])

  return (
    <group {...props} dispose={null}>
      <instancedMesh
        ref={instancedFoliageRef}
        args={[(nodes.foliage as Mesh).geometry, leafMaterial, count]}
        renderOrder={2}
        castShadow
      />

      <instancedMesh
        ref={instancedTrunkRef}
        args={[(nodes.trunk as Mesh).geometry, trunkMaterial, count]}
        castShadow
      />
    </group>
  )
}

useGLTF.preload('/models/tree.glb')
