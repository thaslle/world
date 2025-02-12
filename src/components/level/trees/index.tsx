import { useEffect, useRef } from 'react'
import { GroupProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import {
  Mesh,
  Object3D,
  InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three'

import LeafMaterial from './material'

import { treesPositions } from './positions'

type GLTFResult = GLTF & {
  nodes: {
    trunk: Mesh
    foliage: Mesh
  }
  materials: {
    trunk: MeshStandardMaterial
  }
}

// Type for the Props of the Instances component
interface TreesProps extends GroupProps {
  temp?: Object3D
}

export const Trees: React.FC<TreesProps> = ({
  temp = new Object3D(),
  ...props
}) => {
  // Refs for the instanced meshes
  const instancedTrunkRef = useRef<InstancedMesh>(null)
  const instancedFoliageRef = useRef<InstancedMesh>(null)

  // We clamp the number of trees
  const count = treesPositions.length

  const { nodes, materials } = useGLTF('/models/tree.glb') as GLTFResult

  const leafMaterial = LeafMaterial()

  const trunkMaterial = new MeshBasicMaterial({
    map: materials.trunk.map,
  })

  useEffect(() => {
    if (!instancedTrunkRef.current || !instancedFoliageRef.current) return

    // Set positions for both the trunk and foliage instances
    treesPositions.forEach((item, i) => {
      // Randomize position for both trunk and foliage
      const x = item.position.x
      const y = item.position.y
      const z = item.position.z

      const rotation = item.rotation
      const scale = item.scale

      // Set the trunk position
      temp.position.set(x, y - 0.2, z)
      temp.rotation.set(0, rotation, 0)
      temp.scale.set(scale, scale, scale)
      temp.updateMatrix()
      instancedTrunkRef.current?.setMatrixAt(i, temp.matrix)

      // Set the foliage position with an offset on the y-axis to make it appear above the trunk
      temp.position.set(x, y + 3.5, z) // Foliage slightly higher
      temp.rotation.set(0, rotation, 0)
      temp.scale.set(scale * 1.2, scale * 0.7, scale * 1.2)
      temp.updateMatrix()
      instancedFoliageRef.current?.setMatrixAt(i, temp.matrix)
    })

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
        frustumCulled={false}
        castShadow
      />

      <instancedMesh
        ref={instancedTrunkRef}
        args={[(nodes.trunk as Mesh).geometry, trunkMaterial, count]}
        frustumCulled={false}
        castShadow
      />
    </group>
  )
}

useGLTF.preload('/models/tree.glb')
