import { useEffect, useRef, useMemo } from 'react'
import {
  MeshStandardMaterial,
  LoopOnce,
  LoopRepeat,
  Group,
  SkinnedMesh,
} from 'three'
import { GroupProps, useFrame, useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

import {
  varyingVertexShader,
  mainVertexShader,
  mainFragmentShader,
  varyingFragmentShader,
} from './shaders/fragments.glsl'

export const Maria = (props: GroupProps) => {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF('/models/maria.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  const { characterState } = useStore()

  useEffect(() => {
    const action = actions[characterState]
    if (action) {
      action.reset().fadeIn(0.3)

      if (characterState === 'Jump') {
        action.setLoop(LoopOnce, 0) // Play the animation once
        action.clampWhenFinished = true // Keep the last frame when finished
      } else {
        action.setLoop(LoopRepeat, Infinity) // Default to infinite loop for other states
        action.clampWhenFinished = false // Reset this behavior for other animations
      }

      action.play() // Start the animation
    }

    return () => {
      if (action) {
        action.fadeOut(0.3) // Fade out the animation on cleanup
      }
    }
  }, [characterState])

  const playerMaterial = useRef(
    new MeshStandardMaterial({
      map: (materials.m_char as MeshStandardMaterial).map,
    }),
  )

  playerMaterial.current.userData = playerMaterial.current.userData || {}

  playerMaterial.current.onBeforeCompile = (shader) => {
    playerMaterial.current.userData.shader = shader

    // Declare the new uniform
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uWaterHeight = { value: settings.waterHeight }

    // Inject custom varyings into the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      varyingVertexShader.search,
      varyingVertexShader.replace,
    )

    // Calculate world position and normal in the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      mainVertexShader.search,
      mainVertexShader.replace,
    )

    // Inject custom varyings and Fresnel logic into the fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      mainFragmentShader.search,
      mainFragmentShader.replace,
    )

    // Add Fresnel effect logic while preserving the original texture
    shader.fragmentShader = shader.fragmentShader.replace(
      varyingFragmentShader.search,
      varyingFragmentShader.replace,
    )
  }

  // Update the uTime uniform on each frame
  useFrame(({ clock }) => {
    if (!playerMaterial.current.userData.shader) return
    playerMaterial.current.userData.shader.uniforms.uTime.value =
      clock.getElapsedTime()
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="Body"
            geometry={(nodes.Body as SkinnedMesh).geometry}
            skeleton={(nodes.Body as SkinnedMesh).skeleton}
            material={playerMaterial.current}
            castShadow
            receiveShadow
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/maria.glb')
