import { useEffect } from 'react'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

export const FrameLoop = () => {
  const setFrameloop = useStore((state) => state.setFrameloop)
  const setAudioEnabled = useAudio((state) => state.setAudioEnabled)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setFrameloop(document.hidden ? 'never' : 'always')
      setAudioEnabled(document.hidden ? false : true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return null
}
