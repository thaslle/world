import { useEffect, useRef } from 'react'
import { useAudio } from '~/hooks/use-audio'

type AudioKey = keyof typeof audios

const audios = {
  walking: { audio: new Audio('/sounds/walking.mp3'), loop: true },
  walkingwater: { audio: new Audio('/sounds/walkingwater.mp3'), loop: true },
  running: { audio: new Audio('/sounds/running.mp3'), loop: true },
}

export const AudioControl = () => {
  const {
    audioToPlay,
    audioEnabled,
    lastAudioPlayed,
    lastTimeAudioPlayed,
    setLastAudioPlayed,
    setLastTimeAudioPlayed,
  } = useAudio()

  const audio = useRef(new Audio())

  // Use force: false to wait for 100ms since the last audio before playing another one
  const playAudio = (action: AudioKey, force = true) => {
    if (!audioEnabled || !audio.current) return
    if (!force && Date.now() - lastTimeAudioPlayed < 100) return

    setLastTimeAudioPlayed(Date.now())

    // Check if the current audio is different from the last one played
    if (lastAudioPlayed && lastAudioPlayed !== action) {
      // Stop the last audio properly before starting the new one
      audio.current.pause()
      audio.current.currentTime = 0
    }

    // Update the reference to the new audio
    audio.current = audios[action].audio
    audio.current.loop = audios[action].loop

    // Play the new audio
    if (audio.current) {
      audio.current.play()
    }

    setLastAudioPlayed(action)
  }

  useEffect(() => {
    if (audioToPlay && audioToPlay in audios) {
      playAudio(audioToPlay as AudioKey)
    } else {
      setLastAudioPlayed('paused')
      if (audio.current) audio.current.pause()
    }
  }, [audioToPlay])

  return null
}
