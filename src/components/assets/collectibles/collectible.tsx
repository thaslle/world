import { useEffect, useMemo, useRef } from 'react'
import { GroupProps, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import {
  BallCollider,
  InstancedRigidBodies,
  InstancedRigidBodyProps,
  RapierRigidBody,
} from '@react-three/rapier'
import { Mesh, MeshStandardMaterial, Object3D, InstancedMesh } from 'three'

import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

interface CollectibleProps extends GroupProps {
  temp?: Object3D
  nodes: Mesh
  material: MeshStandardMaterial
}

export const Collectible: React.FC<CollectibleProps> = ({
  temp = new Object3D(),
  nodes,
  material,
}) => {
  const collectiblePositions = useStore((state) => state.collectiblePositions)

  // Refs for the instanced meshes
  const instancedCollectibleRef = useRef<InstancedMesh>(null)
  const rigidBodies = useRef<RapierRigidBody[]>(null)

  const collectibleMaterial = new CustomShaderMaterial({
    baseMaterial: MeshStandardMaterial,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uWaterHeight: { value: settings.waterHeight },
    },
    map: material.map,
  })

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = []

    // Set positions for both the trunk and foliage instances
    collectiblePositions.forEach((item, i) => {
      instances.push({
        key: `instance_${i}`,
        userData: { id: i },
        position: item.position,
        rotation: item.rotation,
      })
    })

    return instances
  }, [collectiblePositions])

  // We need to update InstanceMesh position on each re render
  useEffect(() => {
    if (!instancedCollectibleRef.current || !collectiblePositions.length) return

    // Set positions
    collectiblePositions.forEach((item, i) => {
      const x = item.position.x
      const y = item.position.y
      const z = item.position.z

      const rX = item.rotation.x
      const rY = item.rotation.y
      const rZ = item.rotation.z

      temp.position.set(x, y, z)
      temp.rotation.set(rX, rY, rZ)
      temp.updateMatrix()
      instancedCollectibleRef.current?.setMatrixAt(i, temp.matrix)

      instances.forEach((instance) => {
        if (instance.key === `instance_${i}`) {
          // Mutate the position directly
          instance.position = item.position
        }
      })
    })

    // Update the instance matrices
    instancedCollectibleRef.current.instanceMatrix.needsUpdate = true
  }, [temp, collectiblePositions])

  useFrame(({ clock }) => {
    collectibleMaterial.uniforms.uTime.value = clock.getElapsedTime()
  })

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
        colliders={false}
        colliderNodes={[<BallCollider args={[1]} />]}
        name="collectible"
      >
        <instancedMesh
          ref={instancedCollectibleRef}
          args={[
            nodes.geometry,
            collectibleMaterial,
            collectiblePositions.length,
          ]}
          frustumCulled={false}
          castShadow
        />
      </InstancedRigidBodies>
    </Float>
  )
}
