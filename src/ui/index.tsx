import { useEffect, useState } from 'react'

import { Learn } from './learn'
import { Collected } from './collected'
import { Message } from './message'
import { Image } from './image'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

import { settings } from '~/config/settings'

import s from './ui.module.scss'

export const UI = () => {
  const collected = useStore((state) => state.collected)
  const status = useStore((state) => state.status)
  const setStatus = useStore((state) => state.setStatus)
  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  const [showLearn, setShowLearn] = useState(false)

  // Play birthday music
  useEffect(() => {
    if (status === 'cheers') setAudioToPlay('birthday')
    if (status === 'place') setAudioToPlay('success')

    let timer: ReturnType<typeof setTimeout>

    if (status === 'explore')
      timer = setTimeout(() => setStatus('finished'), 10000)

    if (status === 'learn') timer = setTimeout(() => setShowLearn(true), 2000)
    if (status === 'find') setShowLearn(false)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [status])

  return (
    <div className={s.ui}>
      <div className={s.top}>
        <Collected collected={collected} />
      </div>

      <div className={s.bottom}>
        {showLearn && <Learn />}

        {status === 'find' && collected === 1 && (
          <Message>
            {`A primeira já foi, agora falta${settings.collectiblesNeeded - collected > 1 && 'm'} ${settings.collectiblesNeeded - collected} concha${settings.collectiblesNeeded - collected > 1 && 's'}`}
          </Message>
        )}

        {status === 'find' && collected === settings.collectiblesNeeded - 1 && (
          <Message>Quase lá! Só mais uma concha!</Message>
        )}

        {status === 'find' && (
          <Message>
            {`Encontre ${settings.collectiblesNeeded} concha${settings.collectiblesNeeded > 1 && 's'} na praia ao redor da ilha`}
          </Message>
        )}

        {status === 'place' && (
          <Message>
            Você conseguiu! Agora leve as conchas para o alto da montanha
          </Message>
        )}

        {status === 'book' && (
          <Message>Que tal ler um bom livro pra relaxar?</Message>
        )}

        {status === 'treasure' && (
          <Message>
            Encontre um lugar fora da grande ilha pra ter uma surpresa
          </Message>
        )}

        {status === 'explore' &&
          collected < settings.collectiblesNeeded &&
          settings.collectiblesNeeded - collected > 1 && (
            <Message>
              {`Agora o mundo é seu! Aproveite para explorar a ilha e encontrar todas as ${settings.collectiblesNeeded - collected} conchas que ainda restam`}
            </Message>
          )}

        {status === 'explore' &&
          settings.collectiblesNeeded - collected === 1 && (
            <Message>
              {`Agora o mundo é seu! Aproveite para explorar a ilha e encontrar a última concha`}
            </Message>
          )}

        {status === 'explore' && settings.collectiblesNeeded === collected && (
          <Message>
            {`Agora o mundo é seu! Aproveite para explorar a ilha e e ver a vista do alto da montanha`}
          </Message>
        )}
      </div>

      {status === 'quote' && (
        <Image src="/images/book-quote.jpg" next="treasure" />
      )}

      {status === 'cheers' && (
        <Image
          src="/images/joey-30-years.gif"
          next="explore"
          closeTime={21000}
        />
      )}
    </div>
  )
}
