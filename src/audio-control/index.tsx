import { useEffect, useRef } from 'react'

import { settings } from '~/config/settings'
import { useAudio } from '~/hooks/use-audio'

type AudioKey = keyof typeof audios
type PlayerAudioKey = keyof typeof playerAudios

const audios = {
  success: new Audio('/sounds/success.mp3'),
  pop: new Audio('/sounds/pop.mp3'),
  close: new Audio('/sounds/close.mp3'),
  subtitle: new Audio('/sounds/subtitle.mp3'),
  lock: new Audio('/sounds/lock.mp3'),
  birthday: new Audio('/sounds/birthday.mp3'),
}

const playerAudios = {
  walking: { audio: new Audio('/sounds/walking.mp3'), loop: true },
  running: { audio: new Audio('/sounds/running.mp3'), loop: true },
  yawning: { audio: new Audio('/sounds/yawning.mp3'), loop: false },
}

export const AudioControl = () => {
  const {
    audioToPlay,
    audioEnabled,
    lastTimeAudioPlayed,
    lastAudioPlayed,
    playerAudioToPlay,
    lastPlayerAudioPlayed,
    setLastTimeAudioPlayed,
    setLastAudioPlayed,
    setLastPlayerAudioPlayed,
  } = useAudio()

  const playerAudio = useRef(new Audio())

  // Use force: false to wait for 100ms since the last audio before playing another one
  const playAudio = (action: AudioKey, force = true) => {
    if (!audioEnabled) return
    if (!force && Date.now() - lastTimeAudioPlayed < 100) return

    setLastTimeAudioPlayed(Date.now())

    // There is a special condition for when the last audio is the birthday song
    if (
      lastAudioPlayed === 'birthday' &&
      Date.now() - lastTimeAudioPlayed < 21000
    )
      return

    // Update the reference to the new audio
    const audio = audios[action]
    audio.play()

    setLastAudioPlayed(action)
  }

  useEffect(() => {
    if (!audioToPlay.audio || !(audioToPlay.audio in audios)) return

    playAudio(audioToPlay.audio as AudioKey)

    // If is the birthday theme we turn down background audio volume
    if (audioToPlay.audio !== 'birthday' || !background.current) return
    background.current.volume = 0
    const birthdayTimer = setTimeout(
      () => (background.current.volume = settings.backgroundAudioVolume),
      21000,
    )

    return () => {
      if (birthdayTimer) clearTimeout(birthdayTimer)
    }
  }, [audioToPlay])

  // Payer Audio
  // I decided to handle player audio in a separeted function so it can play over the assets
  // audio which creates a more immersive experience
  const playPlayerAudio = (action: PlayerAudioKey) => {
    if (!audioEnabled || !playerAudio.current) return

    // Check if the current audio is different from the last one played
    if (lastPlayerAudioPlayed && lastPlayerAudioPlayed !== action) {
      // Stop the last audio properly before starting the new one
      playerAudio.current.pause()
      playerAudio.current.currentTime = 0
    }

    // Update the reference to the new audio
    playerAudio.current = playerAudios[action].audio
    playerAudio.current.loop = playerAudios[action].loop

    // Play the new audio
    if (playerAudio.current) playerAudio.current.play()

    setLastPlayerAudioPlayed(action)
  }

  useEffect(() => {
    if (playerAudioToPlay && playerAudioToPlay in playerAudios) {
      playPlayerAudio(playerAudioToPlay as PlayerAudioKey)
    } else {
      setLastPlayerAudioPlayed('paused')
      if (playerAudio.current) playerAudio.current.pause()
    }
  }, [playerAudioToPlay])

  // Background audio
  const background = useRef(new Audio('/sounds/background.mp3'))

  useEffect(() => {
    if (audioEnabled) {
      background.current.currentTime = 0
      background.current.play()
      background.current.loop = true
      background.current.volume = settings.backgroundAudioVolume
    } else {
      background.current.pause()
    }
  }, [audioEnabled])

  return null
}
