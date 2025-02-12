import { Float, useGLTF } from '@react-three/drei'
import { BallCollider, RigidBody, vec3 } from '@react-three/rapier'
import { Color, Mesh, MeshStandardMaterial, MeshToonMaterial } from 'three'
import { GLTF } from 'three-stdlib'
import { useControls } from 'leva'
import { useSpring } from '@react-spring/core'
import { a } from '@react-spring/three'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

type GLTFResult = GLTF & {
  nodes: {
    Chest_Base: Mesh
    Chest_Base_1: Mesh
    Chest_Base_2: Mesh
    Chest_Top: Mesh
    Chest_Top_1: Mesh
  }
  materials: {
    Metal: MeshStandardMaterial
    DarkWood: MeshStandardMaterial
    Wood: MeshStandardMaterial
  }
}

export const Treasure = () => {
  const setStatus = useStore((state) => state.setStatus)
  const status = useStore((state) => state.status)
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  const rotateStatus = status === 'cheers' ? 1 : 0

  const { DARKWOOD_BASE_COLOR, LIGHWOOD_BASE_COLOR, METAL_BASE_COLOR } =
    useControls('Chest', {
      DARKWOOD_BASE_COLOR: { value: '#765c34', label: 'DARKWOOD' },
      LIGHWOOD_BASE_COLOR: { value: '#8d6a3d', label: 'LIGHTWOOD' },
      METAL_BASE_COLOR: { value: '#838160', label: 'METAL' },
    })

  // Convert color hex values to three.js Color objects
  const DARKWOOD_COLOR = new Color(DARKWOOD_BASE_COLOR)
  const LIGHWOOD_COLOR = new Color(LIGHWOOD_BASE_COLOR)
  const METAL_COLOR = new Color(METAL_BASE_COLOR)

  const { nodes } = useGLTF('/models/chest.glb') as GLTFResult

  const darkWoodMaterial = new MeshToonMaterial({ color: DARKWOOD_COLOR })
  const lightWoodMaterial = new MeshToonMaterial({ color: LIGHWOOD_COLOR })
  const metalMaterial = new MeshToonMaterial({ color: METAL_COLOR })

  const position = vec3({
    x: 113,
    y: 3.6,
    z: -119,
  })

  const { spring } = useSpring({
    spring: rotateStatus,
    config: {
      mass: 5,
      tension: 2000,
      friction: 50,
      precision: 0.0001,
    },
  })

  const rotation = spring.to([0, 1], [-Math.PI / 2, -Math.PI])

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
              setStatus('cheers')
              setAudioToPlay('lock')
            }
          }}
        />
        <group dispose={null} rotation-y={-Math.PI / 1.5}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh
              geometry={nodes.Chest_Base.geometry}
              material={darkWoodMaterial}
              castShadow
            />
            <mesh
              geometry={nodes.Chest_Base_1.geometry}
              material={lightWoodMaterial}
              castShadow
            />
            <mesh
              geometry={nodes.Chest_Base_2.geometry}
              material={metalMaterial}
              castShadow
            />
          </group>
          <a.group position={[-0.001, 0.525, -0.353]} rotation-x={rotation}>
            <mesh
              geometry={nodes.Chest_Top.geometry}
              material={darkWoodMaterial}
              castShadow
            />
            <mesh
              geometry={nodes.Chest_Top_1.geometry}
              material={lightWoodMaterial}
              castShadow
            />
          </a.group>
        </group>
      </RigidBody>
    </Float>
  )
}

useGLTF.preload('/models/chest.glb')
