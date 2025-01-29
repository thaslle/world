import { Float, useGLTF } from '@react-three/drei'
import { BallCollider, RigidBody, vec3 } from '@react-three/rapier'
import { Mesh, MeshStandardMaterial } from 'three'

import { useStore } from '~/hooks/use-store'

export const Treasure = () => {
  const setStatus = useStore((state) => state.setStatus)

  const { nodes, materials } = useGLTF('/models/barrel.gltf')
  const meshNode = nodes.Prop_Barrel as Mesh
  const meshMaterial = materials.Atlas as MeshStandardMaterial

  const position = vec3({
    x: 113,
    y: 3.6,
    z: -119,
  })

  return (
    <Float
      speed={4}
      floatIntensity={0.005}
      floatingRange={[-0.005, 0.005]}
      rotationIntensity={0.015}
    >
      <RigidBody type="fixed" name="rack" colliders={false} position={position}>
        <BallCollider
          args={[1]}
          sensor
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') setStatus('cheers')
          }}
        />
        <mesh geometry={meshNode.geometry} material={meshMaterial} castShadow />
      </RigidBody>
    </Float>
  )
}
