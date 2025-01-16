import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

import { settings } from '~/config/settings'
import { useStore } from '~/hooks/use-store'

type ShadowProps = {
  playerRef: React.RefObject<THREE.Group>
}

export const Shadow: React.FC<ShadowProps> = ({ playerRef }) => {
  const showPhysics = useStore((state) => state.physics)

  const lightRef = useRef<THREE.DirectionalLight>(null)
  const positionWorldPosition = new THREE.Vector3()

  const { SHADOW_SIZE } = useControls('Camera', {
    SHADOW_SIZE: { value: 10, min: 1, max: 300, step: 1 },
  })

  useLayoutEffect(
    () => void lightRef.current?.shadow.camera.updateProjectionMatrix(),
    [SHADOW_SIZE],
  )

  useFrame(() => {
    if (!lightRef.current || !playerRef.current) return

    playerRef.current.getWorldPosition(positionWorldPosition)

    lightRef.current.position.x =
      positionWorldPosition.x + settings.directionalLight.position.x

    lightRef.current.position.y =
      positionWorldPosition.y + settings.directionalLight.position.y

    lightRef.current.position.z =
      positionWorldPosition.z + settings.directionalLight.position.z
  })

  return (
    <>
      {lightRef.current && showPhysics && (
        <primitive
          object={new THREE.DirectionalLightHelper(lightRef.current, 1)}
        />
      )}
      <directionalLight
        ref={lightRef}
        target={playerRef.current || undefined}
        castShadow
        intensity={2}
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera
          attach="shadow-camera"
          left={-SHADOW_SIZE}
          right={SHADOW_SIZE}
          top={SHADOW_SIZE}
          bottom={-SHADOW_SIZE}
        />
      </directionalLight>
    </>
  )
}
