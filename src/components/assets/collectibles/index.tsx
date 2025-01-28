import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial } from 'three'

import { Collectible } from './collectible'
import { Pick } from './pick'

export const Collectibles = () => {
  const { nodes, materials } = useGLTF('/models/barrel.gltf')
  const meshNode = nodes.Prop_Barrel as Mesh
  const meshMaterial = materials.Atlas as MeshStandardMaterial

  return (
    <>
      <Collectible nodes={meshNode} material={meshMaterial} />
      <Pick nodes={meshNode} material={meshMaterial} />
    </>
  )
}

useGLTF.preload('/models/barrel.gltf')

