import { useEffect, useRef } from 'react'
import { extend, ReactThreeFiber, useFrame } from '@react-three/fiber'
import { PositionalAudio, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

import { useControls } from 'leva'

import { settings } from '~/config/settings'
import { useStore } from '~/hooks/use-store'

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
    uColorNear: new THREE.Vector3(),
    uColorFar: new THREE.Vector3(),
    uFogColor: new THREE.Color(settings.fog.color),
    uFogNear: settings.fog.near,
    uFogFar: settings.fog.far,
  },
  vertexShader,
  fragmentShader,
)

extend({ WaterMaterial })

export const Water = () => {
  const ready = useStore((state) => state.ready)

  const { COLOR_BASE_NEAR, COLOR_BASE_FAR } = useControls('Water', {
    COLOR_BASE_NEAR: { value: '#2eF7FF', label: 'NEAR' },
    COLOR_BASE_FAR: { value: '#1DFFE1', label: 'FAR' },
  })

  // Convert color hex values to three.js Color objects
  const COLOR_NEAR = new THREE.Color(COLOR_BASE_NEAR)
  const COLOR_FAR = new THREE.Color(COLOR_BASE_FAR)

  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial & typeof WaterMaterial>(null)

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uColorNear.value = COLOR_NEAR
    materialRef.current.uniforms.uColorFar.value = COLOR_FAR
  }, [COLOR_NEAR, COLOR_FAR])

  useFrame(({ clock }) => {
    if (!materialRef.current || !meshRef.current) return

    // Update time
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <>
      {ready && (
        <>
          <group position={[-settings.terrainSize / 2, 0, 0]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={100}
            />
          </group>

          <group position={[settings.terrainSize / 2, 0, 0]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={100}
            />
          </group>

          <group position={[0, 0, -settings.terrainSize / 2]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={100}
            />
          </group>
          <group position={[0, 0, settings.terrainSize / 2]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={100}
            />
          </group>
        </>
      )}

      <mesh
        ref={meshRef}
        rotation-x={-Math.PI / 2}
        position-y={settings.waterHeight}
        renderOrder={1}
      >
        <planeGeometry args={[2048, 2048]} />
        <waterMaterial ref={materialRef} transparent depthWrite={false} />
      </mesh>
    </>
  )
}

