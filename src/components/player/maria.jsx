/* eslint-disable react-hooks/exhaustive-deps */
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 .\public\models\maria.gltf -o src/components/Player/maria.jsx 
*/

import { useEffect, useRef, useMemo } from 'react'
import { MeshStandardMaterial, LoopOnce, LoopRepeat } from 'three'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

import { useStore } from '../../hooks/use-store'

export function Maria(props) {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/maria.gltf')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  const customMaterial = new MeshStandardMaterial({
    map: materials.m_char.map,
  })

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

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="Body"
            geometry={nodes.Body.geometry}
            material={customMaterial}
            skeleton={nodes.Body.skeleton}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/maria.gltf')
