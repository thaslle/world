import { settings } from '~/config/settings'
import s from './collected.module.scss'

type CollectedProps = {
  collected: number
}

export const Collected = ({ collected }: CollectedProps) => {
  const length = settings.collectibles.toString().split('').length
  const collectedLength = collected.toString().split('').length

  const clip = length - collectedLength

  const decimals = Array.from({ length }, (_, index) => index)
  decimals.reverse()

  const decimalsCount = collected
    .toString()
    .padStart(decimals.length, '0')
    .split('')
    .reverse()

  return (
    <div className={s.collected}>
      <div
        className={s.wrapper}
        style={{ clipPath: `inset(0 0 0 ${clip}ch round 3em)` }}
      >
        <div className={s.numbers}>
          {decimals.map((index) => {
            const value = parseFloat(decimalsCount[index])
            const valueDec = parseFloat(decimalsCount[index + 1])

            const translate = valueDec > 0 && value === 0 ? 0 : value

            return (
              <div
                className={s.roll}
                key={index}
                style={{
                  transform: `translateY(-${translate * 100}%)`,
                  opacity: index === 0 || value > 0 || valueDec > 0 ? 1 : 0,
                }}
              >
                {[...Array(10)].map((_, i) => {
                  return (
                    <div className={s.item} key={i}>
                      {i}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
