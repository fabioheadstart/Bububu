export interface SpeakOptions {
  rate?:  number   // 0.1–10  (default 0.85)
  pitch?: number   // 0–2     (default 1.0)
  lang?:  string   // BCP 47  (default 'en-US')
}

export interface AudioProvider {
  speak(text: string, options?: SpeakOptions): Promise<void>
  cancel(): void
  readonly isSupported: boolean
}
