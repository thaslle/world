import React from 'react'
import { clsx } from 'clsx'

import s from './subtitle.module.scss'

type SubtitleProps = {
  children: React.ReactNode
  wrapper?: boolean
  split?: boolean
  delay?: number
  time?: number
}

const SplitText = ({ children, delay = 0.4, time = 0.02 }: SubtitleProps) => {
  if (!children) return null

  const text = typeof children === 'string' ? children : children.toString()
  const splitWord = text.split(' ')

  let universalCounter = 0 // Universal counter for all letters

  return (
    <>
      {splitWord.map((w, i) => (
        <span key={i} className={s.word}>
          {w.split('').map((c, il) => {
            const lDelay = delay + universalCounter * time
            universalCounter++

            return (
              <span
                key={il}
                className={s.letter}
                style={{ animationDelay: `${lDelay}s` }}
              >
                {c}
              </span>
            )
          })}
        </span>
      ))}
    </>
  )
}

export const Subtitle = ({
  children,
  wrapper = true,
  split = true,
  delay = 0.4,
  time = 0.02,
}: SubtitleProps) => {
  if (!children) return null

  return (
    <div className={clsx(s.subtitle, { [s.background]: wrapper })}>
      {split ? (
        <SplitText delay={delay} time={time}>
          {children}
        </SplitText>
      ) : (
        children
      )}
    </div>
  )
}
