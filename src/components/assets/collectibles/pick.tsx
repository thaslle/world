import { useEffect, useRef, useState } from 'react'
import { Group, Mesh, MeshStandardMaterial } from 'three'
import { GroupProps } from '@react-three/fiber'
import { useSpring } from '@react-spring/core'
import { a } from '@react-spring/three'

import { useStore } from '~/hooks/use-store'

interface PickProps extends GroupProps {
  nodes: Mesh
  material: MeshStandardMaterial
}

export const Pick: React.FC<PickProps> = ({ nodes, material }) => {
  const collected = useStore((state) => state.collected)
  const lastCollected = useStore((state) => state.lastCollected)
  const lastCollectedPosition = useStore((state) => state.lastCollectedPosition)

  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)

  useEffect(() => {
    if (
      !groupRef.current ||
      !meshRef.current ||
      collected === 0 ||
      !lastCollected
    )
      return

    groupRef.current.position.x = lastCollectedPosition.position.x
    groupRef.current.position.y = lastCollectedPosition.position.y
    groupRef.current.position.z = lastCollectedPosition.position.z

    meshRef.current.setRotationFromEuler(lastCollectedPosition.rotation)

    setVisible(true)
    setActive(1)

    const timer = setTimeout(() => {
      setVisible(false)
      setActive(0)
    }, 200)

    return () => clearTimeout(timer)
  }, [collected, lastCollected, lastCollectedPosition])

  // create a common spring that will be used later to interpolate other values
  const { spring } = useSpring({
    spring: active,
    config: { mass: 5, tension: 500, friction: 50, precision: 0.0001 },
  })

  // interpolate values from commong spring
  const scale = spring.to([0, 1], [0.6, 0.3])
  const rotation = spring.to([0, 1], [0, Math.PI * 2])
  const position = spring.to([0, 1], [0, 3])

  return (
    <group ref={groupRef} visible={visible} position={[73, 2, 150]}>
      <a.group position-y={position} rotation-y={rotation} scale={scale}>
        <a.mesh
          ref={meshRef}
          geometry={nodes.geometry}
          material={material}
          castShadow
        />
      </a.group>
    </group>
  )
}
