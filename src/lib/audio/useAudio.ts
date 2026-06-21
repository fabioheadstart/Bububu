import { useState, useCallback, useEffect, useRef } from 'react'
import { defaultAudioProvider, WebSpeechProvider } from './audioProvider'
import type { AudioProvider, SpeakOptions } from './types'

const _webSpeech = new WebSpeechProvider()

interface UseAudioReturn {
  speak:        (text: string, options?: SpeakOptions) => Promise<void>
  speakWord:    (word: string) => Promise<void>
  speakSentence:(sentence: string) => Promise<void>
  cancel:       () => void
  isPlaying:    boolean
  isSupported:  boolean
}

export function useAudio(provider: AudioProvider = defaultAudioProvider): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const providerRef = useRef(provider)

  useEffect(() => { return () => { providerRef.current.cancel() } }, [])

  const speak = useCallback(async (text: string, options?: SpeakOptions) => {
    setIsPlaying(true)
    try {
      await providerRef.current.speak(text, options)
    } catch (err) {
      console.warn('Audio provider falhou, fallback WebSpeech:', err)
      try { await _webSpeech.speak(text, options) } catch { /* silencioso */ }
    } finally {
      setIsPlaying(false)
    }
  }, [])

  const speakWord     = useCallback((word: string) =>
    speak(word, { rate: 0.85, lang: 'en-US' }), [speak])

  const speakSentence = useCallback((sentence: string) =>
    speak(sentence, { rate: 0.90, lang: 'en-US' }), [speak])

  const cancel = useCallback(() => {
    providerRef.current.cancel()
    setIsPlaying(false)
  }, [])

  return { speak, speakWord, speakSentence, cancel, isPlaying, isSupported: provider.isSupported }
}

export function useBububuVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speakBububu = useCallback(() => {
    if (!audioRef.current) audioRef.current = new Audio('/audio/bububu.mp3')
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance('bububu!')
      u.lang = 'pt-BR'; u.pitch = 2.0
      window.speechSynthesis.speak(u)
    })
  }, [])

  return { speakBububu }
}
