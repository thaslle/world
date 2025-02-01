import { Book } from './book'
import { Checkmark } from './checkmark'
import { Treasure } from './treasure'
import { Collectibles } from './collectibles'

import { useStore } from '~/hooks/use-store'

export const Assets = () => {
  const status = useStore((state) => state.status)

  return (
    <>
      <Collectibles />
      {status === 'place' && <Checkmark />}
      {status === 'book' && <Book />}
      {(status === 'treasure' || status === 'cheers') && <Treasure />}
    </>
  )
}
