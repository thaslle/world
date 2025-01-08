import { useRef } from 'react'
import { ShaderMaterial } from 'three'
import { extend, ReactThreeFiber, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

import { useControls } from 'leva'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterMaterial: ReactThreeFiber.Node<
        typeof WaterMaterial & JSX.IntrinsicElements['shaderMaterial'],
        typeof WaterMaterial
      >
    }
  }
}

const WaterMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  vertexShader,
  fragmentShader,
)

extend({ WaterMaterial })

export const Water = () => {
  const { OCEAN_BOTTOM } = useControls('Level', {
    OCEAN_BOTTOM: '#d16841', //#03e3ff
  })

  const materialRef = useRef<ShaderMaterial & typeof WaterMaterial>(null)

  //Update time
  useFrame(({ clock }) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={1}>
        <planeGeometry args={[2048, 2048]} />
        <waterMaterial ref={materialRef} transparent />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position-y={-0.1}>
        <planeGeometry args={[2048, 2048]} />
        <meshStandardMaterial color={OCEAN_BOTTOM} />
      </mesh>
    </>
  )
}
