import { create } from 'zustand'

type AudioProps = {
  audioToPlay: string | null
  audioEnabled: boolean
  lastAudioPlayed: string | null
  lastTimeAudioPlayed: number

  setAudioToPlay: (audio: string | null) => void
  setAudioEnabled: (enabled: boolean) => void
  setLastAudioPlayed: (audio: string) => void
  setLastTimeAudioPlayed: (time: number) => void
}

export const useAudio = create<AudioProps>((set) => ({
  audioToPlay: null,
  audioEnabled: false,
  pauseAudio: false,
  lastAudioPlayed: null,
  lastTimeAudioPlayed: Date.now(),

  setAudioToPlay: (audio) => set(() => ({ audioToPlay: audio })),
  setAudioEnabled: (enabled) => set(() => ({ audioEnabled: enabled })),
  setLastAudioPlayed: (audio) => set(() => ({ lastAudioPlayed: audio })),
  setLastTimeAudioPlayed: (time) => set(() => ({ lastTimeAudioPlayed: time })),
}))
