import { clsx } from 'clsx'
import { useEffect } from 'react'
import { useAudio } from '~/hooks/use-audio'

import { Subtitle } from '../subtitle'

import s from './learn.module.scss'

export const Jump = () => {
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
        <Subtitle wrapper={false}>Aperte</Subtitle>
        <div className={clsx(s.button, s.space)}>
          <Subtitle wrapper={false} delay={0.52}>
            Espaço
          </Subtitle>
        </div>
        <Subtitle wrapper={false} delay={0.62}>
          para pular
        </Subtitle>
      </Subtitle>
    </div>
  )
}

