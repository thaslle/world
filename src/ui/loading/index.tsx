import { clsx } from 'clsx'
import { useProgress } from '@react-three/drei'
import { Subtitle } from '../subtitle'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

import s from './loading.module.scss'

export const Loading = () => {
  const { progress, active } = useProgress()

  const ready = useStore((state) => state.ready)
  const setReady = useStore((state) => state.setReady)
  const setStatus = useStore((state) => state.setStatus)

  const setAudioEnabled = useAudio((state) => state.setAudioEnabled)

  const handleReady = () => {
    setReady(true)
    setStatus('learn')
    setAudioEnabled(true)
  }

  const time = 0.005

  return (
    <div
      className={clsx(s.wrapper, { [s.loaded]: !active }, { [s.hide]: ready })}
    >
      <div className={s.waves}></div>
      <div className={s.message}>
        <h1>
          <Subtitle wrapper={false} time={time}>
            Oi, Maria
          </Subtitle>
        </h1>
        <div className={s.paragraph}>
          <Subtitle wrapper={false} time={time}>
            Seja bem-vinda a sua experiência de aniversário. Siga as pistas para
            guiar a personagem (que é você mesma) nessa breve jornada em busca
            de uma surpresa.
          </Subtitle>
        </div>
      </div>
      <div className={s.loading}>
        <div className={s.loader}>
          <span
            style={{ clipPath: `inset(0 ${100 - progress}% 0 0 round 3em)` }}
          ></span>
        </div>

        <button className={s.start} onClick={() => handleReady()}>
          <span className={s.words}>
            <Subtitle wrapper={false} time={time} delay={1.1}>
              Começar
            </Subtitle>
          </span>
        </button>
      </div>
    </div>
  )
}
