import React, { useEffect } from 'react'
import { Subtitle } from '../subtitle'

import { useAudio } from '~/hooks/use-audio'

import s from './message.module.scss'

type MessageProps = {
  children: React.ReactNode
}

export const Message = ({ children }: MessageProps) => {
  if (!children) return null

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
      <Subtitle>{children}</Subtitle>
    </div>
  )
}

