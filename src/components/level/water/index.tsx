import { useEffect, useRef } from 'react'
import { extend, ReactThreeFiber, useFrame } from '@react-three/fiber'
import { useFBO, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

import { useControls } from 'leva'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const depthMaterial = new THREE.MeshDepthMaterial()
depthMaterial.depthPacking = THREE.RGBADepthPacking
depthMaterial.blending = THREE.NoBlending

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
    uDepth: 0.0,
    uMaxDepth: 1.0,
    uResolution: [0, 0],
    uCameraNear: 0,
    uCameraFar: 0,
    uColorNear: new THREE.Vector3(),
    uColorFar: new THREE.Vector3(),
  },
  vertexShader,
  fragmentShader,
)

extend({ WaterMaterial })

export const Water = () => {
  const { MAX_DEPTH, COLOR_BASE_NEAR, COLOR_BASE_FAR } = useControls('Water', {
    MAX_DEPTH: { value: 0.55, min: 0, max: 5 },
    COLOR_BASE_NEAR: { value: '#2eF7FF', label: 'NEAR' },
    COLOR_BASE_FAR: { value: '#1DFFE1', label: 'FAR' },
  })

  // Convert color hex values to three.js Color objects
  const COLOR_NEAR = new THREE.Color(COLOR_BASE_NEAR)
  const COLOR_FAR = new THREE.Color(COLOR_BASE_FAR)

  // Render borders
  const renderTarget = useFBO({
    depth: true,
    type: THREE.FloatType,
  })

  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial & typeof WaterMaterial>(null)

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uColorNear.value = COLOR_NEAR
    materialRef.current.uniforms.uColorFar.value = COLOR_FAR
  }, [COLOR_NEAR, COLOR_FAR])

  useFrame(({ gl, scene, camera, clock }) => {
    if (!materialRef.current || !meshRef.current) return

    // We hide the water mesh and render the scene to the render target
    meshRef.current.visible = false
    gl.setRenderTarget(renderTarget)
    scene.overrideMaterial = depthMaterial
    gl.render(scene, camera)

    // We reset the scene and show the water mesh
    scene.overrideMaterial = null
    meshRef.current.visible = true
    gl.setRenderTarget(null)

    // Set the uniforms

    // Update time
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()

    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    materialRef.current.uniforms.uDepth.value = renderTarget.texture
    materialRef.current.uniforms.uMaxDepth.value = MAX_DEPTH
    const pixelRatio = gl.getPixelRatio()
    materialRef.current.uniforms.uResolution.value = [
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio,
    ]
    materialRef.current.uniforms.uCameraNear.value = camera.near
    materialRef.current.uniforms.uCameraFar.value = camera.far
  })

  return (
    <>
      <mesh ref={meshRef} rotation-x={-Math.PI / 2} position-y={1.65}>
        <planeGeometry args={[2048, 2048]} />
        <waterMaterial ref={materialRef} transparent />
      </mesh>
    </>
  )
}

