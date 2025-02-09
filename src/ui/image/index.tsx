import { clsx } from 'clsx'
import { useEffect, useState } from 'react'

import { useStore, StatusProps } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

import s from './image.module.scss'

type ImageProps = {
  src: string
  next: StatusProps
  closeTime?: number
}

export const Image = ({ src, next, closeTime = 10 }: ImageProps) => {
  const setStatus = useStore((state) => state.setStatus)
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  const [close, setClose] = useState(false)
  const [showClose, setShowClose] = useState(false)

  useEffect(() => {
    if (!close) return

    setAudioToPlay('close')
    const timer = setTimeout(() => setStatus(next), 200)

    return () => {
      clearTimeout(timer)
    }
  }, [close])

  // Set a delay time to show close button
  useEffect(() => {
    const showCloseTimer = setTimeout(() => setShowClose(true), closeTime)
    return () => {
      clearTimeout(showCloseTimer)
    }
  }, [])

  return (
    <div className={s.image}>
      <div className={clsx(s.wrapper, { [s.reverse]: close })}>
        <figure>
          <img src={src} />
        </figure>
        {showClose && (
          <div className={s.close} onClick={() => setClose(true)}>
            <span>Close</span>
          </div>
        )}
      </div>
    </div>
  )
}
