import React from 'react'
import s from './subtitle.module.scss'

type SubtitleProps = {
  children: React.ReactNode
}

export const Subtitle = ({ children }: SubtitleProps) => {
  if (!children) return

  const text = typeof children === 'string' ? children : children.toString()
  const splitText = text.split('')

  return (
    <div className={s.wrapper}>
      <div className={s.subtitle}>
        {splitText.map((c, i) => (
          <span key={i} style={{ animationDelay: `${0.1 + i / 100}s` }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
