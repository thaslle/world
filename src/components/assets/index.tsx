import { Checkmark } from './checkmark'
import { Collectibles } from './collectibles'

import { useStore } from '~/hooks/use-store'

export const Assets = () => {
  const status = useStore((state) => state.status)

  return (
    <>
      <Collectibles />
      {status === 'place' && <Checkmark />}
    </>
  )
}
