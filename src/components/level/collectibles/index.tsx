import { useEffect, useMemo, useRef } from 'react'
import { GroupProps } from '@react-three/fiber'
import { Float, useGLTF } from '@react-three/drei'
import {
  InstancedRigidBodies,
  InstancedRigidBodyProps,
  RapierRigidBody,
} from '@react-three/rapier'
import { Mesh, MeshStandardMaterial, Object3D, InstancedMesh } from 'three'

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import { useStore } from '~/hooks/use-store'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

// Type for the Props of the Instances component
interface CollectiblesProps extends GroupProps {
  temp?: Object3D
}

export const Collectibles: React.FC<CollectiblesProps> = ({
  temp = new Object3D(),
}) => {
  const collectiblePositions = useStore((state) => state.collectiblePositions)

  // Refs for the instanced meshes
  const instancedCollectibleRef = useRef<InstancedMesh>(null)
  const rigidBodies = useRef<RapierRigidBody[]>(null)

  const { nodes, materials } = useGLTF('/models/barrel.gltf')
  const meshMaterial = materials.Atlas as MeshStandardMaterial

  const collectibleMaterial = new CustomShaderMaterial({
    baseMaterial: MeshStandardMaterial,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: { uHover: { value: false } },
    map: meshMaterial.map,
  })

  const random = useMemo(() => Math.random(), [])

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = []

    // Set positions for both the trunk and foliage instances
    collectiblePositions.forEach((position, i) => {
      const x = position.x
      const y = position.y + 0.5
      const z = position.z

      instances.push({
        key: 'instance_' + i,
        userData: { id: i },
        position: [x, y, z],
        rotation: [
          Math.PI * random * 0.2 * x,
          Math.PI * random * 0.2 * x,
          Math.PI * random * 0.2 * x,
        ],
      })
    })

    return instances
  }, [collectiblePositions])

  // We need to update InstanceMesh position on each re render
  useEffect(() => {
    if (!instancedCollectibleRef.current || !collectiblePositions.length) return

    // Set positions for both the trunk and foliage instances
    collectiblePositions.forEach((position, i) => {
      const x = position.x
      const y = position.y + 0.5
      const z = position.z

      temp.position.set(x, y, z)
      temp.rotation.set(
        Math.PI * random * 0.2 * x,
        Math.PI * random * 0.2 * x,
        Math.PI * random * 0.2 * x,
      )
      temp.updateMatrix()
      instancedCollectibleRef.current?.setMatrixAt(i, temp.matrix)

      instances.push({
        key: i,
        position: [x, y, z],
      })
    })

    // Update the instance matrices
    instancedCollectibleRef.current.instanceMatrix.needsUpdate = true
  }, [temp, collectiblePositions])

  return (
    <Float
      speed={4}
      floatIntensity={0.005}
      floatingRange={[-0.005, 0.005]}
      rotationIntensity={0.015}
    >
      <InstancedRigidBodies
        ref={rigidBodies}
        instances={instances}
        type="fixed"
        colliders="ball"
        name="collectible"
      >
        <instancedMesh
          ref={instancedCollectibleRef}
          args={[
            (nodes.Prop_Barrel as Mesh).geometry,
            collectibleMaterial,
            collectiblePositions.length,
          ]}
          castShadow
        />
      </InstancedRigidBodies>
    </Float>
  )
}

useGLTF.preload('/models/barrel.gltf')

