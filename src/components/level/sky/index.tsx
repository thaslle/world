import { useEffect, useRef } from 'react'
import { useControls } from 'leva'
import { extend, ReactThreeFiber, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

import { settings } from '~/config/settings'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      skyMaterial: ReactThreeFiber.Node<
        typeof SkyMaterial & JSX.IntrinsicElements['shaderMaterial'],
        typeof SkyMaterial
      >
    }
  }
}

const SkyMaterial = shaderMaterial(
  {
    uTime: 0,
    uWaterHeight: settings.waterHeight,
    uUpColor: new THREE.Color(),
    uHorizonColor: new THREE.Color(),
  },
  vertexShader,
  fragmentShader,
)

extend({ SkyMaterial })

export const Sky = () => {
  const { SKY_UP_BASE, SKY_HORIZON_BASE } = useControls('Sky', {
    SKY_UP_BASE: { value: '#9ffffc', label: 'UP' }, //#9efbff
    SKY_HORIZON_BASE: { value: '#e6fffa', label: 'HORIZON' }, // #d9ffff
  })

  const SKY_UP = new THREE.Color(SKY_UP_BASE)
  const SKY_HORIZON = new THREE.Color(SKY_HORIZON_BASE)

  const materialRef = useRef<THREE.ShaderMaterial & typeof SkyMaterial>(null)

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uUpColor.value = SKY_UP
    materialRef.current.uniforms.uHorizonColor.value = SKY_HORIZON
  }, [SKY_UP, SKY_HORIZON])

  useFrame(({ clock }) => {
    if (!materialRef.current) return

    // Update time
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <>
      <mesh frustumCulled={false}>
        <cylinderGeometry
          args={[
            settings.levelRadius,
            settings.levelRadius,
            settings.levelRadius,
            6,
            1,
            false,
          ]}
        />
        <skyMaterial ref={materialRef} side={THREE.BackSide} />
      </mesh>
    </>
  )
}
