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
            const valueDec = parseFloat(decimalsCount[index + 1] ?? 0)
            const translate = (value + valueDec * 10) * 100
            const shadow = [...Array(valueDec + 1)].map(
              (_, s) => `0 ${1.2 * 10 * (s + 1)}em 0 var(--font-color)`,
            )

            return (
              <div
                className={s.roll}
                key={index}
                style={{
                  transform: `translateY(-${translate}%)`,
                  opacity: index === 0 || value > 0 || valueDec > 0 ? 1 : 0,
                  textShadow: shadow.join(),
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
