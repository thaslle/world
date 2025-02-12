import { useEffect, useState } from 'react'

import { KeyboardMap } from '~/utils/keyboard-map'
import { Controls } from '~/config/controls'
import { useStore } from '~/hooks/use-store'

import { Walk } from './walk'
import { Run } from './run'
import { Jump } from './jump'

import s from './learn.module.scss'

export const Learn = () => {
  const [message, setMessage] = useState('walk')
  const setStatus = useStore((state) => state.setStatus)
  const keyboardMap = KeyboardMap()

  const downHandler = ({ key, code }: { key: string; code: string }) => {
    const keyPressed = code === 'Space' ? code : key

    keyboardMap.forEach((control) => {
      if (control.keys.includes(keyPressed)) {
        switch (control.name) {
          case Controls.forward:
          case Controls.backward:
          case Controls.left:
          case Controls.right:
            if (message === 'walk') setMessage('run')
            break
          case Controls.run:
            if (message === 'run') setMessage('jump')
            break

          case Controls.jump:
            if (message === 'jump') setStatus('find')
            break
        }
      }
    })
  }

  useEffect(() => {
    window.addEventListener('keydown', downHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [keyboardMap, message])

  return (
    <div className={s.wrapper}>
      {message === 'walk' && <Walk />}
      {message === 'run' && <Run />}
      {message === 'jump' && <Jump />}
    </div>
  )
}
