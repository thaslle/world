import { GroupProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial } from 'three'

import LeafMaterial from './material'

export const Tree = (props: GroupProps) => {
  const { nodes, materials } = useGLTF('/models/tree.glb')

  const leafMaterial = LeafMaterial()

  const trunkMaterial = new MeshStandardMaterial({
    map: (materials.trunk as MeshStandardMaterial).map,
  })

  return (
    <group name="tree" {...props} dispose={null}>
      <mesh
        geometry={(nodes.trunk as Mesh).geometry}
        material={trunkMaterial}
        scale={[1, 1.4, 1]}
        castShadow
      />
      <mesh
        geometry={(nodes.foliage as Mesh).geometry}
        position={[-1, 4.5, 0]}
        scale={[1, 0.8, 1.1]}
        castShadow
        material={leafMaterial}
        renderOrder={2}
      ></mesh>
    </group>
  )
}

useGLTF.preload('/models/tree.glb')
