import { useEffect } from 'react'
import { useStore } from '~/hooks/use-store'

const Controls = {
  debug: '.',
  physics: ',',
}

type HandlerProps = {
  key: string
}

export const Debug = () => {
  const setDebug = useStore((state) => state.setDebug)
  const setPhysics = useStore((state) => state.setPhysics)

  const downHandler = ({ key }: HandlerProps) => {
    if (key === Controls.debug) {
      setDebug()
    }

    if (key === Controls.physics) {
      setPhysics()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return null
}

