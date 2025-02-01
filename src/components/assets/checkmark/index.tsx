import { BallCollider, RigidBody, vec3 } from '@react-three/rapier'
import * as THREE from 'three'

import { useStore } from '~/hooks/use-store'

export const Checkmark = () => {
  const setStatus = useStore((state) => state.setStatus)

  const vertexShader = /*glsl*/ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `
  const fragmentShader = /*glsl*/ `
      varying vec2 vUv;
      void main() {
        float y = vUv.y;
        vec3 uColor = mix(vec3(1.0), vec3(0.569,0.985,0.890), smoothstep(1.0, 0.3, y));
        gl_FragColor = vec4(uColor, 1.0 - y);
      }
    `

  const position = vec3({
    x: -60,
    y: 28.5,
    z: -63,
  })

  return (
    <RigidBody type="fixed" name="rack" colliders={false} position={position}>
      <BallCollider
        args={[1]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') setStatus('book')
        }}
      />
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 1, 16, 1, true]} />
        <shaderMaterial
          fog={false}
          transparent={true}
          depthWrite={false}
          alphaTest={0.5}
          side={THREE.DoubleSide}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </RigidBody>
  )
}
