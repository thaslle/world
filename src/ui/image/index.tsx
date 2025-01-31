import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { useStore, StatusProps } from '~/hooks/use-store'

import s from './image.module.scss'

type ImageProps = {
  src: string
  next: StatusProps
}

export const Image = ({ src, next }: ImageProps) => {
  const setStatus = useStore((state) => state.setStatus)
  const [close, setClose] = useState(false)

  useEffect(() => {
    if (!close) return

    const timer = setTimeout(() => setStatus(next), 1000)

    return () => {
      clearTimeout(timer)
    }
    return
  }, [close])

  return (
    <div className={s.image}>
      <div className={clsx(s.wrapper, { [s.reverse]: close })}>
        <figure>
          <img src={src} />
        </figure>
        <div className={s.close} onClick={() => setClose(true)}>
          <span>Close</span>
        </div>
      </div>
    </div>
  )
}
