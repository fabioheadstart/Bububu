import { loadProgress, saveProgress } from './progressStorage'
import type { UserProgress } from '@/types'

// ─── Singleton store — compartilhado por TODAS as instâncias de useProgress ──
let _progress: UserProgress = loadProgress()
const _listeners = new Set<() => void>()

export function getProgress(): UserProgress {
  return _progress
}

export function setProgress(next: UserProgress): void {
  _progress = next
  saveProgress(next)
  _listeners.forEach(fn => fn())
}

export function subscribeProgress(fn: () => void): () => void {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}
