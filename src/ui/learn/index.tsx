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
    keyboardMap.forEach((control) => {
      if (control.keys.includes(key) || control.keys.includes(code)) {
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
    // End tutorial when mouse is clicked
    const onMouseDown = () => setStatus('find')

    window.addEventListener('keydown', downHandler) // keyboard
    document.addEventListener('mousedown', onMouseDown) // click
    document.addEventListener('touchstart', onMouseDown) // touch

    return () => {
      window.removeEventListener('keydown', downHandler)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('touchstart', onMouseDown)
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
