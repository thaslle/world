import { useEffect } from 'react'
import { useStore } from '../hooks/use-store'

const Controls = {
  debug: '.',
  physics: ',',
}

export const Debug = () => {
  const { setDebug, setPhysics } = useStore()

  const downHandler = ({ key }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
