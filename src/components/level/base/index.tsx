import { useEffect, useRef } from 'react'
import { extend, ReactThreeFiber } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

import { settings } from '~/config/settings'
import { useStore } from '~/hooks/use-store'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      baseMaterial: ReactThreeFiber.Node<
        typeof BaseMaterial & JSX.IntrinsicElements['shaderMaterial'],
        typeof BaseMaterial
      >
    }
  }
}

const BaseMaterial = shaderMaterial(
  {
    uLightPosition: settings.directionalLight.position,
    uLightColor: settings.directionalLight.color,
    uLightIntensity: settings.directionalLight.intensity,
    uGroundColor: new THREE.Vector3(),
  },
  vertexShader,
  fragmentShader,
)

extend({ BaseMaterial })

export const Base = () => {
  const { oceanBaseColor } = useStore()

  const materialRef = useRef<THREE.ShaderMaterial & typeof BaseMaterial>(null)

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uGroundColor.value = oceanBaseColor
  }, [oceanBaseColor])

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.1}>
        <planeGeometry args={[2048, 2048]} />
        <baseMaterial ref={materialRef} />
      </mesh>
    </>
  )
}

