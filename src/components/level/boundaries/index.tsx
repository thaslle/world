import { RigidBody } from '@react-three/rapier'
import { settings } from '~/config/settings'

export const Boundaries = () => {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      {/* Left Wall */}
      <mesh position={[-settings.terrainSize / 2, 2.5, 0]}>
        <boxGeometry args={[0.1, 5, settings.terrainSize]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[settings.terrainSize / 2, 2.5, 0]}>
        <boxGeometry args={[0.1, 5, settings.terrainSize]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, 2.5, -settings.terrainSize / 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[settings.terrainSize, 5, 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2.5, settings.terrainSize / 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[settings.terrainSize, 5, 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </RigidBody>
  )
}

