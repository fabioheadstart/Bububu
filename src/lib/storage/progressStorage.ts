import type { UserProgress, AppMode } from '@/types'

const STORAGE_KEY = 'bububu:progress'
const SCHEMA_VERSION = 1

interface StoredData {
  version: number
  progress: UserProgress
}

function defaultProgress(mode: AppMode = 'pro'): UserProgress {
  return {
    userId: crypto.randomUUID(),
    mode,
    difficulty: 'easy',
    bububuLevel: 1,
    wordsLearned: [],
    wordReviewCounts: {},
    masteredWords: [],
    streak: 0,
    lastSessionDate: '',
    lastFedAt: 0,
    wordsToday: 0,
    lastFeedDate: '',
  }
}

// Migração suave: garante que saves antigos recebem os novos campos
export function migrateProgress(p: Partial<UserProgress>): UserProgress {
  return {
    ...defaultProgress(p.mode),
    ...p,
    difficulty:        p.difficulty        ?? 'easy',
    wordsToday:        p.wordsToday        ?? 0,
    lastFeedDate:      p.lastFeedDate      ?? '',
    wordReviewCounts:  p.wordReviewCounts  ?? {},
    masteredWords:     p.masteredWords     ?? [],
  }
}

export function loadProgress(mode?: AppMode): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress(mode)

    const stored = JSON.parse(raw) as StoredData
    if (stored.version !== SCHEMA_VERSION) return defaultProgress(mode)

    return migrateProgress(stored.progress)
  } catch {
    return defaultProgress(mode)
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    const data: StoredData = { version: SCHEMA_VERSION, progress }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage pode estar cheio ou bloqueado (modo privado iOS)
    console.warn('Bububu: não foi possível salvar progresso.')
  }
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('bububu:onboarding_done')
}

export function markOnboardingDone(): void {
  try { localStorage.setItem('bububu:onboarding_done', '1') } catch { /* ignore */ }
}

export function hasOnboardingDone(): boolean {
  try { return localStorage.getItem('bububu:onboarding_done') === '1' } catch { return false }
}
