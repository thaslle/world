import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { vec3 } from '@react-three/rapier'
import { Mesh, Euler, MeshToonMaterial } from 'three'

import { rocksPositions } from './positions'
import { settings } from '~/config/settings'

import {
  varyingVertexShader,
  mainVertexShader,
  mainFragmentShader,
  varyingFragmentShader,
} from './shaders/fragments.glsl'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    rock: Mesh
  }
  materials: {}
}

export const Rocks = () => {
  const { nodes } = useGLTF('/models/rocks.glb') as GLTFResult

  const rockMaterial = new MeshToonMaterial({ color: '#6e7164' })

  useFrame(({ clock }) => {
    if (!rockMaterial.userData.shader) return
    rockMaterial.userData.shader.uniforms.uTime.value = clock.getElapsedTime()
  })

  rockMaterial.onBeforeCompile = (shader) => {
    rockMaterial.userData.shader = shader

    if (!shader) return

    shader.uniforms.uTime = { value: 0.0 }
    shader.uniforms.uWaterHeight = { value: settings.waterHeight }

    shader.vertexShader = shader.vertexShader.replace(
      varyingVertexShader.search,
      varyingVertexShader.replace,
    )

    shader.vertexShader = shader.vertexShader.replace(
      mainVertexShader.search,
      mainVertexShader.replace,
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      varyingFragmentShader.search,
      varyingFragmentShader.replace,
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      mainFragmentShader.search,
      mainFragmentShader.replace,
    )
  }

  return (
    <group dispose={null}>
      {rocksPositions.map((item, i) => {
        return (
          <mesh
            key={i}
            geometry={nodes.rock.geometry}
            material={rockMaterial}
            position={vec3(item.position)}
            rotation={
              new Euler(item.rotation.x, item.rotation.y, item.rotation.z)
            }
            scale={vec3(item.scale)}
            castShadow
          />
        )
      })}
    </group>
  )
}

useGLTF.preload('/models/rocks.glb')
