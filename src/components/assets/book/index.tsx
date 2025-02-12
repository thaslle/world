import { useRef } from 'react'
import { GLTF } from 'three-stdlib'
import { useFrame } from '@react-three/fiber'
import { Float, useGLTF } from '@react-three/drei'
import { BallCollider, RigidBody, vec3 } from '@react-three/rapier'
import {
  Group,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Vector3,
} from 'three'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

type GLTFResult = GLTF & {
  nodes: {
    cover: Mesh
    pages: Mesh
  }
  materials: {
    book: MeshStandardMaterial
  }
}

export const Book = () => {
  const setStatus = useStore((state) => state.setStatus)
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  const bookRef = useRef<Group>(null)

  const { nodes, materials } = useGLTF('/models/book.glb') as GLTFResult
  const bookMaterial = new MeshLambertMaterial({
    map: materials.book.map,
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
            if (e.other.rigidBodyObject?.name === 'player') {
              setStatus('quote')
              setAudioToPlay('pop')
            }
          }}
        />
        <group ref={bookRef} dispose={null}>
          <mesh
            geometry={nodes.cover.geometry}
            material={bookMaterial}
            castShadow
          />
          <mesh
            geometry={nodes.pages.geometry}
            material={bookMaterial}
            castShadow
          />
        </group>
      </RigidBody>
    </Float>
  )
}

useGLTF.preload('/models/book.glb')
