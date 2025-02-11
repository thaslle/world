import { useEffect } from 'react'
import { useAudio } from '~/hooks/use-audio'

import s from './learn.module.scss'
import { Arrow } from './arrow.svg'
import { Shift } from './shift.svg'

export const Learn = () => {
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  // Set a delay time to play audio
  useEffect(() => {
    const delayAUdio = setTimeout(() => setAudioToPlay('subtitle'), 400)
    return () => {
      clearTimeout(delayAUdio)
    }
  }, [])

  return (
    <div className={s.wrapper}>
      <div className={s.arrows}>
        <div className={s.arrow}>
          <Arrow />
        </div>
        <div className={s.arrow}>
          <Arrow />
        </div>
        <div className={s.arrow}>
          <Arrow />
        </div>
        <div className={s.arrow}>
          <Arrow />
        </div>
      </div>
      <div className={s.bottom}>
        <div className={s.subtitle}>Use as setas para andar</div>
        <div className={s.button}>
          <Shift /> correr
        </div>
      </div>
    </div>
  )
}
