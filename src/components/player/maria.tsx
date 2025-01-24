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
import PlayerMaterial from './material'

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

  // Creating a material to apply water level
  const materialRef = useRef<MeshStandardMaterial>(new MeshStandardMaterial())

  useEffect(() => {
    if (materialRef.current) {
      const customMaterial = PlayerMaterial({
        map: (materials.m_char as MeshStandardMaterial).map,
      })
      materialRef.current = customMaterial
    }
  }, [materials.m_char]) // Recreate material when the texture changes

  // Update the uTime uniform on each frame
  // useFrame(({ clock }) => {
  //   if (!materialRef.current || !materialRef.current.userData.uniforms.uTime)
  //     return
  //   materialRef.current.userData.uniforms.uTime.value = clock.getElapsedTime()
  // })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="Body"
            geometry={(nodes.Body as SkinnedMesh).geometry}
            skeleton={(nodes.Body as SkinnedMesh).skeleton}
            material={materialRef.current}
            castShadow
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/maria.glb')

