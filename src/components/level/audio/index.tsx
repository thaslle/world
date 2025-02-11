import { PositionalAudio } from '@react-three/drei'

import { settings } from '~/config/settings'
import { useStore } from '~/hooks/use-store'

export const Audio = () => {
  const ready = useStore((state) => state.ready)
  const waveDistance = 80

  return (
    <>
      {ready && (
        <>
          <group position={[-settings.terrainSize, -waveDistance * 10, 0]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={waveDistance}
            />
          </group>

          <group position={[settings.terrainSize, -waveDistance * 10, 0]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={waveDistance}
            />
          </group>

          <group position={[0, -waveDistance * 10, -settings.terrainSize]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={waveDistance}
            />
          </group>
          <group position={[0, -waveDistance * 10, settings.terrainSize]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/waves.mp3"
              distance={waveDistance}
            />
          </group>

          <group position={[-65, 35, -55]}>
            <PositionalAudio
              autoplay
              loop
              url="/sounds/birds.mp3"
              distance={30}
            />
          </group>
        </>
      )}
    </>
  )
}
