import { create } from 'zustand'

type AudioToPlayProps = {
  audio: string | null
  time: number
}
type AudioProps = {
  audioToPlay: AudioToPlayProps
  audioEnabled: boolean
  lastTimeAudioPlayed: number
  lastAudioPlayed: string | null
  playerAudioToPlay: string | null
  lastPlayerAudioPlayed: string | null

  setAudioToPlay: (audio: string | null) => void
  setAudioEnabled: (enabled: boolean) => void
  setLastTimeAudioPlayed: (time: number) => void
  setLastAudioPlayed: (audio: string | null) => void
  setPlayerAudioToPlay: (audio: string | null) => void
  setLastPlayerAudioPlayed: (audio: string | null) => void
}

export const useAudio = create<AudioProps>((set) => ({
  audioToPlay: { audio: null, time: Date.now() },
  audioEnabled: false,
  pauseAudio: false,
  lastTimeAudioPlayed: Date.now(),
  lastAudioPlayed: null,
  playerAudioToPlay: null,
  lastPlayerAudioPlayed: null,

  setAudioToPlay: (audio) =>
    set(() => ({ audioToPlay: { audio: audio, time: Date.now() } })),
  setAudioEnabled: (enabled) => set(() => ({ audioEnabled: enabled })),
  setLastTimeAudioPlayed: (time) => set(() => ({ lastTimeAudioPlayed: time })),
  setLastAudioPlayed: (audio) => set(() => ({ lastAudioPlayed: audio })),
  setPlayerAudioToPlay: (audio) => set(() => ({ playerAudioToPlay: audio })),
  setLastPlayerAudioPlayed: (audio) =>
    set(() => ({ lastPlayerAudioPlayed: audio })),
}))
