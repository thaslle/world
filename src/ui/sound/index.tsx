import { clsx } from 'clsx'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'
import { Volume } from './icons'

import s from './sound.module.scss'

export const Sound = () => {
  const ready = useStore((state) => state.ready)
  const audioEnabled = useAudio((state) => state.audioEnabled)
  const setAudioEnabled = useAudio((state) => state.setAudioEnabled)

  const handleVolume = () => {
    setAudioEnabled(!audioEnabled)
  }

  return (
    ready && (
      <div className={s.volume}>
        <button
          className={clsx(s.toggle, { [s.enabled]: audioEnabled })}
          onClick={() => handleVolume()}
        >
          <Volume />
        </button>
      </div>
    )
  )
}

