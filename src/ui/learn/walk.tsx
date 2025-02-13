import { useEffect, useState } from 'react'
import { useAudio } from '~/hooks/use-audio'

import { Arrow } from './icons'
import { Subtitle } from '../subtitle'

import s from './learn.module.scss'

export const Walk = () => {
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)
  const [isMobile, setIsMobile] = useState(false)

  // Set a delay time to play audio
  useEffect(() => {
    const delayAUdio = setTimeout(() => setAudioToPlay('subtitle'), 400)

    // If mobile, we are only showing the click and drag message
    const handleResize = () => setIsMobile(window.innerWidth < 768)

    // Run on initial render and every resize event
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(delayAUdio)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      {!isMobile && (
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
            <Subtitle>Use as setas ou clique e arraste para andar</Subtitle>
          </div>
        </>
      )}

      {isMobile && (
        <div className={s.bottom}>
          <Subtitle>Clique e arraste para andar</Subtitle>
        </div>
      )}
    </>
  )
}

