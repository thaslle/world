import { Book } from './book'
import { Checkmark } from './checkmark'
import { Treasure } from './treasure'
import { Collectibles } from './collectibles'
import { ExplosionConfetti } from './confetti'

import { useStore } from '~/hooks/use-store'

export const Assets = () => {
  const status = useStore((state) => state.status)

  return (
    <>
      <Collectibles />
      {status === 'place' && <Checkmark />}
      {status === 'book' && <Book />}
      {(status === 'treasure' || status === 'cheers') && <Treasure />}
      {status === 'cheers' && (
        <ExplosionConfetti
          isExploding={true}
          colors={[0x9962ff, 0xff8c2d, 0x53ffc6]}
          position={[113, 2.5, -119]}
        />
      )}
    </>
  )
}
