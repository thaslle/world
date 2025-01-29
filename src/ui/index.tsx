// import { clsx } from 'clsx'
//import { useEffect, useState } from 'react'
import { Subtitle } from './subtitle'

import { useStore } from '~/hooks/use-store'

import s from './ui.module.scss'
import { settings } from '~/config/settings'

export const UI = () => {
  const collected = useStore((state) => state.collected)
  const status = useStore((state) => state.status)
  const setStatus = useStore((state) => state.setStatus)

  //const { setAudioToPlay, setAudioEnabled } = useAudioManager()
  // const [playGame, setPlayGame] = useState(false)
  // const [showScore, setShowScore] = useState(false)

  return (
    <div className={s.ui}>
      <div className={s.top}>
        <p className={s.collected}>{collected}</p>
      </div>

      <div className={s.bottom}>
        {status === 'find' && (
          <Subtitle>
            {`Encontre ${settings.collectiblesNeeded} concha${settings.collectiblesNeeded > 1 && 's'} na praia ao redor da ilha`}
          </Subtitle>
        )}

        {status === 'place' && (
          <p className={s.subtitle}>
            Você conseguiu! Agora leve as conchas para o alto da montanha
          </p>
        )}

        {status === 'book' && (
          <p className={s.subtitle}>É hora de ler um bom livro pra relaxar</p>
        )}

        {status === 'treasure' && (
          <p className={s.subtitle}>
            Encontre um lugar fora da grande ilha pra ter uma surpresa
          </p>
        )}
      </div>

      {status === 'quote' && (
        <div className={s.image}>
          <figure>
            <img src="/images/book-quote.jpg" />
          </figure>
          <div className={s.close} onClick={() => setStatus('treasure')}>
            Close
          </div>
        </div>
      )}

      {status === 'cheers' && (
        <div className={s.image}>
          <figure>
            <img src="/images/joey-30-years.gif" />
          </figure>
          <div className={s.close} onClick={() => setStatus('finished')}>
            Close
          </div>
        </div>
      )}
    </div>
  )
}
