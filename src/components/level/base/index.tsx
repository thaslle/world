import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import CustomShaderMaterial from 'three-custom-shader-material'

import { useStore } from '~/hooks/use-store'
import { settings } from '~/config/settings'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export const Base = () => {
  const { oceanBaseColor } = useStore()

  const materialRef = useRef<any>(null)

  const uniforms = useMemo(
    () => ({
      uGroundColor: { value: new THREE.Vector3() },
    }),
    [],
  )

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uGroundColor.value = oceanBaseColor
  }, [oceanBaseColor])

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-2.1}>
        <planeGeometry
          args={[settings.levelRadius * 2, settings.levelRadius * 2]}
        />
        <CustomShaderMaterial
          ref={materialRef}
          side={THREE.DoubleSide}
          vertexColors
          baseMaterial={THREE.MeshStandardMaterial}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </>
  )
}

