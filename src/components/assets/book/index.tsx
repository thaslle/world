import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, useGLTF } from '@react-three/drei'
import { BallCollider, RigidBody, vec3 } from '@react-three/rapier'
import { Group, Mesh, MeshLambertMaterial, Vector3 } from 'three'

import { useStore } from '~/hooks/use-store'

export const Book = () => {
  const setStatus = useStore((state) => state.setStatus)
  const bookRef = useRef<Group>(null)

  const { nodes, materials } = useGLTF('/models/book.glb')
  const bookMaterial = new MeshLambertMaterial({
    map: (materials.book as MeshLambertMaterial).map,
  })

  const position = vec3({
    x: -57,
    y: 29,
    z: -66,
  })

  useFrame(() => {
    if (!bookRef.current) return
    const axis = new Vector3(0, 1, 0)
    const angle = 0.03
    bookRef.current.rotateOnAxis(axis, angle)
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
            if (e.other.rigidBodyObject?.name === 'player') setStatus('quote')
          }}
        />
        <group ref={bookRef} dispose={null}>
          <mesh
            geometry={(nodes.cover as Mesh).geometry}
            material={bookMaterial}
            castShadow
          />
          <mesh
            geometry={(nodes.pages as Mesh).geometry}
            material={bookMaterial}
            castShadow
          />
        </group>
      </RigidBody>
    </Float>
  )
}

useGLTF.preload('/models/book.glb')
