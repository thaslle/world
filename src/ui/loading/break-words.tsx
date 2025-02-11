import s from './loading.module.scss'

type BreakProps = {
  children: React.ReactNode
}

export const BreakWords = ({ children }: BreakProps) => {
  if (!children) return null

  const text = typeof children === 'string' ? children : children.toString()
  const splitWord = text.split(' ')

  let universalCounter = 0 // Universal counter for all letters

  return (
    <div className={s.text}>
      {splitWord.map((w, i) => (
        <span key={i} className={s.word}>
          {w.split('').map((c, il) => {
            const delay = 0.4 + universalCounter / 100
            universalCounter++

            return (
              <span
                key={il}
                className={s.letter}
                style={{ animationDelay: `${delay}s` }}
              >
                {c}
              </span>
            )
          })}
        </span>
      ))}
    </div>
  )
}
