import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RigidBody, vec3 } from '@react-three/rapier'
import { Mesh, Euler, MeshToonMaterial } from 'three'

//import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import { rocksPositions } from './positions'
import { settings } from '~/config/settings'

import {
  varyingVertexShader,
  mainVertexShader,
  mainFragmentShader,
  varyingFragmentShader,
} from './shaders/fragments.glsl'

export const Rocks = () => {
  const { nodes } = useGLTF('/models/rocks.glb')

  //   const rockMaterial = new CustomShaderMaterial({
  //     baseMaterial: MeshToonMaterial,
  //     vertexShader: vertexShader,
  //     //fragmentShader: fragmentShader,
  //     uniforms: {
  //       uTime: { value: 0 },
  //       uWaterHeight: { value: settings.waterHeight },
  //     },
  //     color: 'gray',
  //   })

  const rockMaterial = new MeshToonMaterial({ color: 'gray' })

  useFrame(({ clock }) => {
    if (!rockMaterial.userData.shader) return
    rockMaterial.userData.shader.uniforms.uTime.value = clock.getElapsedTime()
  })

  rockMaterial.onBeforeCompile = (shader) => {
    rockMaterial.userData.shader = shader

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
          <RigidBody
            key={`rb_${i}`}
            type="fixed"
            colliders="trimesh"
            name="terrain"
          >
            <mesh
              key={i}
              geometry={(nodes.rock as Mesh).geometry}
              material={rockMaterial}
              position={vec3(item.position)}
              rotation={
                new Euler(item.rotation.x, item.rotation.y, item.rotation.z)
              }
              scale={vec3(item.scale)}
              castShadow
            />
          </RigidBody>
        )
      })}
    </group>
  )
}

useGLTF.preload('/models/rocks.glb')
