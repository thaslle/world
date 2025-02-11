import { Learn } from './learn'
import { Collected } from './collected'
import { Subtitle } from './subtitle'
import { Image } from './image'

import { useStore } from '~/hooks/use-store'
import { useAudio } from '~/hooks/use-audio'

import s from './ui.module.scss'
import { settings } from '~/config/settings'
import { useEffect, useState } from 'react'

export const UI = () => {
  const collected = useStore((state) => state.collected)
  const status = useStore((state) => state.status)
  const setStatus = useStore((state) => state.setStatus)
  const [showLearn, setShowLearn] = useState(false)

  const setAudioToPlay = useAudio((state) => state.setAudioToPlay)

  // Play birthday music
  useEffect(() => {
    if (status === 'cheers') setAudioToPlay('birthday')
    if (status === 'place') setAudioToPlay('success')

    let timer: ReturnType<typeof setTimeout>

    if (status === 'explore')
      timer = setTimeout(() => setStatus('finished'), 10000)

    if (status === 'learn') timer = setTimeout(() => setShowLearn(true), 2000)

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
          <Subtitle>
            {`A primeira já foi, agora falta${settings.collectiblesNeeded - collected > 1 && 'm'} ${settings.collectiblesNeeded - collected} concha${settings.collectiblesNeeded - collected > 1 && 's'}`}
          </Subtitle>
        )}

        {status === 'find' && collected === settings.collectiblesNeeded - 1 && (
          <Subtitle>Quase lá! Só mais uma concha!</Subtitle>
        )}

        {status === 'find' && (
          <Subtitle>
            {`Encontre ${settings.collectiblesNeeded} concha${settings.collectiblesNeeded > 1 && 's'} na praia ao redor da ilha`}
          </Subtitle>
        )}

        {status === 'place' && (
          <Subtitle>
            Você conseguiu! Agora leve as conchas para o alto da montanha
          </Subtitle>
        )}

        {status === 'book' && (
          <Subtitle>Que tal ler um bom livro pra relaxar?</Subtitle>
        )}

        {status === 'treasure' && (
          <Subtitle>
            Encontre um lugar fora da grande ilha pra ter uma surpresa
          </Subtitle>
        )}

        {status === 'explore' &&
          collected < settings.collectiblesNeeded &&
          settings.collectiblesNeeded - collected > 1 && (
            <Subtitle>
              {`Agora o mundo é seu! Aproveite para explorar a ilha e encontrar todas as ${settings.collectiblesNeeded - collected} conchas que ainda restam`}
            </Subtitle>
          )}

        {status === 'explore' &&
          settings.collectiblesNeeded - collected === 1 && (
            <Subtitle>
              {`Agora o mundo é seu! Aproveite para explorar a ilha e encontrar a última concha`}
            </Subtitle>
          )}

        {status === 'explore' && settings.collectiblesNeeded === collected && (
          <Subtitle>
            {`Agora o mundo é seu! Aproveite para explorar a ilha e e ver a vista do alto da montanha`}
          </Subtitle>
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
