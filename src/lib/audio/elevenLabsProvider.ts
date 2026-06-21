import type { AudioProvider, SpeakOptions } from './types'

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'  // Rachel — americana clara
const MODEL_ID = 'eleven_turbo_v2_5'
const API_BASE = 'https://api.elevenlabs.io/v1'

const _cache = new Map<string, string>()

async function fetchAudioUrl(text: string, apiKey: string): Promise<string> {
  const key = text.toLowerCase().trim()
  if (_cache.has(key)) return _cache.get(key)!

  const res = await fetch(`${API_BASE}/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.0, use_speaker_boost: true },
    }),
  })

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`)

  const url = URL.createObjectURL(await res.blob())
  _cache.set(key, url)
  return url
}

export class ElevenLabsProvider implements AudioProvider {
  readonly isSupported = true
  private apiKey: string
  private audio: HTMLAudioElement | null = null

  constructor(apiKey: string) { this.apiKey = apiKey }

  async speak(text: string, _options?: SpeakOptions): Promise<void> {
    this.cancel()
    const url = await fetchAudioUrl(text, this.apiKey)
    return new Promise((resolve, reject) => {
      const a = new Audio(url)
      this.audio = a
      a.onended = () => resolve()
      a.onerror = () => reject(new Error('ElevenLabs playback error'))
      a.play().catch(reject)
    })
  }

  cancel(): void {
    if (this.audio) { this.audio.pause(); this.audio = null }
  }
}

const _key = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
export const elevenLabsProvider: ElevenLabsProvider | null =
  _key ? new ElevenLabsProvider(_key) : null
