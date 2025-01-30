import { useStore, StatusProps } from '~/hooks/use-store'

import s from './image.module.scss'

type ImagProps = {
  src: string
  next: StatusProps
}

export const Image = ({ src, next }: ImagProps) => {
  const setStatus = useStore((state) => state.setStatus)

  return (
    <div className={s.image}>
      <div className={s.wrapper}>
        <figure>
          <img src={src} />
        </figure>
        <div className={s.close} onClick={() => setStatus(next)}>
          Close
        </div>
      </div>
    </div>
  )
}
