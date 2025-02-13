import React, { useEffect, useState } from 'react'
import { Subtitle } from '../subtitle'

import { useAudio } from '~/hooks/use-audio'

import s from './message.module.scss'

type MessageProps = {
  children: React.ReactNode
  delay?: number
}

export const Message = ({ children, delay = 0 }: MessageProps) => {
  if (!children) return null

  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)
  const [showMessage, setShowMessage] = useState(false)

  // Set a delay time to play audio
  useEffect(() => {
    const delayMessage = setTimeout(() => setShowMessage(true), delay)
    const delayAudio = setTimeout(() => setAudioToPlay('subtitle'), delay + 400)
    return () => {
      clearTimeout(delayMessage)
      clearTimeout(delayAudio)
    }
  }, [])

  return (
    showMessage && (
      <div className={s.wrapper}>
        <Subtitle>{children}</Subtitle>
      </div>
    )
  )
}

