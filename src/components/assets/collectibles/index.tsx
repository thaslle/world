import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial } from 'three'

import { Collectible } from './collectible'
import { Pick } from './pick'

export const Collectibles = () => {
  const { nodes } = useGLTF('/models/seashell.glb')
  const meshNode = nodes.shell as Mesh

  return (
    <>
      <Collectible nodes={meshNode} />
      <Pick nodes={meshNode} />
    </>
  )
}

useGLTF.preload('/models/seashell.glb')

