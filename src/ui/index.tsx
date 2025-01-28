// import { clsx } from 'clsx'
//import { useEffect, useState } from 'react'

import { useStore } from '~/hooks/use-store'

import s from './ui.module.scss'
import { settings } from '~/config/settings'

export const UI = () => {
  const { collected, status } = useStore()

  //const { setAudioToPlay, setAudioEnabled } = useAudioManager()
  // const [playGame, setPlayGame] = useState(false)
  // const [showScore, setShowScore] = useState(false)

  return (
    <div className={s.ui}>
      <p className={s.collected}>{collected}</p>
      {status === 'find' && (
        <p className={s.subtitle}>
          Encontre {settings.collectiblesNeeded} concha
          {settings.collectiblesNeeded > 1 && 's'} na praia ao redor da ilha
        </p>
      )}

      {status === 'place' && (
        <p className={s.subtitle}>
          Você conseguiu! Agora leve as conchas para o alto da montanha
        </p>
      )}

      {status === 'book' && (
        <p className={s.subtitle}>É hora de ler um bom livro pra relaxar</p>
      )}

      {status === 'dica' && (
        <p className={s.subtitle}>
          Encontre um lugar fora da grande ilha pra ter uma surpresa
        </p>
      )}
    </div>
  )
}
