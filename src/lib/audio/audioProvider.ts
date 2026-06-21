export type { SpeakOptions, AudioProvider } from './types'

import type { AudioProvider, SpeakOptions } from './types'

// ─── Web Speech API ───────────────────────────────────────────────────────────
export class WebSpeechProvider implements AudioProvider {
  readonly isSupported: boolean

  constructor() {
    this.isSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
  }

  speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.isSupported) return Promise.resolve()

    return new Promise((resolve, reject) => {
      window.speechSynthesis.cancel()

      const utterance   = new SpeechSynthesisUtterance(text)
      utterance.lang    = options.lang  ?? 'en-US'
      utterance.rate    = options.rate  ?? 0.85
      utterance.pitch   = options.pitch ?? 1.0

      const voices    = window.speechSynthesis.getVoices()
      const preferred = voices.find(v =>
        v.lang === 'en-US' && /samantha|zira|ava|female/i.test(v.name)
      ) ?? voices.find(v => v.lang === 'en-US')
      if (preferred) utterance.voice = preferred

      utterance.onend   = () => resolve()
      utterance.onerror = (e) => {
        if (e.error === 'interrupted') resolve()
        else reject(new Error(`Speech error: ${e.error}`))
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  cancel(): void {
    if (this.isSupported) window.speechSynthesis.cancel()
  }
}

// ─── Default provider: ElevenLabs se key configurada, senão WebSpeech ─────────
import { elevenLabsProvider } from './elevenLabsProvider'
export const defaultAudioProvider: AudioProvider =
  elevenLabsProvider ?? new WebSpeechProvider()
