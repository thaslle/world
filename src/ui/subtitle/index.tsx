import React, { useEffect } from 'react'
import { useAudio } from '~/hooks/use-audio'

import s from './subtitle.module.scss'

type SubtitleProps = {
  children: React.ReactNode
}

export const Subtitle = ({ children }: SubtitleProps) => {
  if (!children) return null

  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  const text = typeof children === 'string' ? children : children.toString()
  const splitWord = text.split(' ')

  let universalCounter = 0 // Universal counter for all letters

  // Set a delay time to play audio
  useEffect(() => {
    const delayAUdio = setTimeout(() => setAudioToPlay('subtitle'), 400)
    return () => {
      clearTimeout(delayAUdio)
    }
  }, [])

  return (
    <div className={s.wrapper}>
      <div className={s.subtitle}>
        {splitWord.map((w, i) => (
          <span key={i} className={s.word}>
            {w.split('').map((c, il) => {
              const delay = 0.4 + universalCounter / 50
              universalCounter++

              return (
                <span
                  key={il}
                  className={s.letter}
                  style={{ animationDelay: `${delay}s` }}
                >
                  {c}
                </span>
              )
            })}
          </span>
        ))}
      </div>
    </div>
  )
}
