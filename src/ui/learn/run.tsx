import { useEffect } from 'react'
import { useAudio } from '~/hooks/use-audio'

import { Shift } from './icons'
import { Subtitle } from '../subtitle'

import s from './learn.module.scss'

export const Run = () => {
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  // Set a delay time to play audio
  useEffect(() => {
    const delayAUdio = setTimeout(() => setAudioToPlay('subtitle'), 400)
    return () => {
      clearTimeout(delayAUdio)
    }
  }, [])

  return (
    <div className={s.bottom}>
      <Subtitle split={false}>
        <Subtitle wrapper={false}>Segure</Subtitle>
        <div className={s.button}>
          <Shift />{' '}
          <Subtitle wrapper={false} delay={0.52}>
            Shift
          </Subtitle>
        </div>
        <Subtitle wrapper={false} delay={0.62}>
          para correr
        </Subtitle>
      </Subtitle>
    </div>
  )
}

