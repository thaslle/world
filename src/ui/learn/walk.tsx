import { useEffect } from 'react'
import { useAudio } from '~/hooks/use-audio'

import { Arrow } from './icons'
import { Subtitle } from '../subtitle'

import s from './learn.module.scss'

export const Walk = () => {
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  // Set a delay time to play audio
  useEffect(() => {
    const delayAUdio = setTimeout(() => setAudioToPlay('subtitle'), 400)
    return () => {
      clearTimeout(delayAUdio)
    }
  }, [])

  return (
    <>
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
        <Subtitle>Use as setas para andar</Subtitle>
      </div>
    </>
  )
}

