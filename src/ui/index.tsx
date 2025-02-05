import { Collected } from './collected'
import { Subtitle } from './subtitle'
import { Image } from './image'

import { useStore } from '~/hooks/use-store'

import s from './ui.module.scss'
import { settings } from '~/config/settings'

export const UI = () => {
  const collected = useStore((state) => state.collected)
  const status = useStore((state) => state.status)

  //const { setAudioToPlay, setAudioEnabled } = useAudioManager()
  // const [playGame, setPlayGame] = useState(false)
  // const [showScore, setShowScore] = useState(false)

  return (
    <div className={s.ui}>
      <div className={s.top}>
        <Collected collected={collected} />
      </div>

      <div className={s.bottom}>
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
      </div>

      {status === 'quote' && (
        <Image src="/images/book-quote.jpg" next="treasure" />
      )}

      {status === 'cheers' && (
        <Image src="/images/joey-30-years.gif" next="finished" />
      )}
    </div>
  )
}
