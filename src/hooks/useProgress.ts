import { useCallback, useSyncExternalStore } from 'react'
import { getProgress, setProgress, subscribeProgress } from '@/lib/storage/progressStore'
import { loadProgress, clearProgress } from '@/lib/storage/progressStorage'
import { ALL_WORDS, getWordsByLevel } from '@/data/vocabulary/index'
import type { UserProgress, AppMode, DifficultyLevel, VocabEntry } from '@/types'
import { DAILY_LIMIT, MASTERY_THRESHOLD } from '@/types'

// ─── Lookup map O(1) ──────────────────────────────────────────────────────────
const ALL_WORDS_BY_ID = new Map<string, VocabEntry>(ALL_WORDS.map(w => [w.id, w]))

const A1_TOTAL = getWordsByLevel('A1').length
const A2_TOTAL = getWordsByLevel('A2').length
const B1_TOTAL = getWordsByLevel('B1').length

// Quantas palavras NOVAS até o próximo estágio de evolução
function computeWordsUntilNextStage(wordsLearned: string[]): number {
  const byLevel = { A1: 0, A2: 0, B1: 0 }
  for (const id of wordsLearned) {
    const entry = ALL_WORDS_BY_ID.get(id)
    if (entry) byLevel[entry.level]++
  }
  // baby→growing: precisa completar A1 (nível 5 requer 80%+ de A1)
  if (byLevel.A1 < A1_TOTAL) {
    const nextThreshold = Math.ceil(A1_TOTAL * Math.ceil((byLevel.A1 / A1_TOTAL) * 5) / 5)
    return Math.max(1, nextThreshold - byLevel.A1)
  }
  // growing→teen: precisa completar A2
  if (byLevel.A2 < A2_TOTAL) {
    const nextThreshold = Math.ceil(A2_TOTAL * Math.ceil((byLevel.A2 / A2_TOTAL) * 5) / 5)
    return Math.max(1, nextThreshold - byLevel.A2)
  }
  // teen→adult: precisa completar B1
  if (byLevel.B1 < B1_TOTAL) {
    const nextThreshold = Math.ceil(B1_TOTAL * Math.ceil((byLevel.B1 / B1_TOTAL) * 5) / 5)
    return Math.max(1, nextThreshold - byLevel.B1)
  }
  return 0 // MAX
}

function computeLevel(wordsLearned: string[]): number {
  const byLevel = { A1: 0, A2: 0, B1: 0 }
  for (const id of wordsLearned) {
    const entry = ALL_WORDS_BY_ID.get(id)
    if (entry) byLevel[entry.level]++
  }
  const a1Pct = A1_TOTAL > 0 ? byLevel.A1 / A1_TOTAL : 0
  const a2Pct = A2_TOTAL > 0 ? byLevel.A2 / A2_TOTAL : 0
  const b1Pct = B1_TOTAL > 0 ? byLevel.B1 / B1_TOTAL : 0

  if (a1Pct < 1) return Math.max(1, Math.ceil(a1Pct * 5))
  if (a2Pct < 1) return 5 + Math.max(1, Math.ceil(a2Pct * 5))
  return Math.min(10 + Math.max(1, Math.ceil(b1Pct * 5)), 15)
}

function computeLevelProgress(wordsLearned: string[]): number {
  const byLevel = { A1: 0, A2: 0, B1: 0 }
  for (const id of wordsLearned) {
    const entry = ALL_WORDS_BY_ID.get(id)
    if (entry) byLevel[entry.level]++
  }

  function subProgress(count: number, total: number): number {
    if (total === 0) return 0
    const pct    = count / total
    const subLvl = Math.min(Math.floor(pct * 5), 4)
    const lo     = subLvl / 5
    const hi     = (subLvl + 1) / 5
    return (pct - lo) / (hi - lo)
  }

  if (byLevel.A1 < A1_TOTAL) return subProgress(byLevel.A1, A1_TOTAL)
  if (byLevel.A2 < A2_TOTAL) return subProgress(byLevel.A2, A2_TOTAL)
  if (byLevel.B1 < B1_TOTAL) return subProgress(byLevel.B1, B1_TOTAL)
  return 1
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function updateStreak(prev: UserProgress): Pick<UserProgress, 'streak' | 'lastSessionDate'> {
  const today = todayISO()
  if (prev.lastSessionDate === today) return { streak: prev.streak, lastSessionDate: today }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yISO = yesterday.toISOString().slice(0, 10)

  if (prev.lastSessionDate === yISO) return { streak: prev.streak + 1, lastSessionDate: today }

  const reset = prev.mode === 'kids' ? Math.max(prev.streak, 1) : 1
  return { streak: reset, lastSessionDate: today }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export interface RecordWordResult {
  isNew:        boolean
  wordsToday:   number   // após este feed
  justSatiated: boolean  // acabou de atingir o limite agora
  overLimit:    boolean  // já estava acima do limite antes deste feed
  justMastered: boolean  // atingiu MASTERY_THRESHOLD de reviews agora
  reviewCount:  number   // total de reviews desta palavra (0 se nova)
}

export interface UseProgressReturn {
  progress:        UserProgress
  computedLevel:   number
  levelProgress:   number
  dailyLimit:      number
  recordWord:      (entry: VocabEntry) => RecordWordResult
  setMode:              (mode: AppMode) => void
  setDifficulty:        (difficulty: DifficultyLevel) => void
  setUserName:          (name: string) => void
  resetProgress:        () => void
  wordsUntilNextStage:  number
}

export function useProgress(): UseProgressReturn {
  const progress = useSyncExternalStore(subscribeProgress, getProgress)

  const computedLevel = computeLevel(progress.wordsLearned)
  const levelProgress = computeLevelProgress(progress.wordsLearned)
  const dailyLimit    = DAILY_LIMIT[progress.mode]

  const recordWord = useCallback((entry: VocabEntry): RecordWordResult => {
    const prev  = getProgress()
    const today = todayISO()

    // Reset diário se virou o dia
    const dayReset = prev.lastFeedDate !== today
    const wordsTodayBefore = dayReset ? 0 : prev.wordsToday
    const limit = DAILY_LIMIT[prev.mode]

    const overLimit    = wordsTodayBefore >= limit
    const wordsTodayAfter = wordsTodayBefore + 1
    const justSatiated = !overLimit && wordsTodayAfter >= limit

    const isNew = !prev.wordsLearned.includes(entry.id)
    const wordsLearned = isNew ? [...prev.wordsLearned, entry.id] : prev.wordsLearned

    // Mastery tracking — só conta reviews (não o 1º encontro)
    const prevReviewCount   = prev.wordReviewCounts[entry.id] ?? 0
    const alreadyMastered   = prev.masteredWords.includes(entry.id)
    const newReviewCount    = isNew ? 0 : prevReviewCount + 1
    const justMastered      = !isNew && !alreadyMastered && newReviewCount >= MASTERY_THRESHOLD

    const wordReviewCounts = isNew
      ? prev.wordReviewCounts
      : { ...prev.wordReviewCounts, [entry.id]: newReviewCount }

    const masteredWords = justMastered
      ? [...prev.masteredWords, entry.id]
      : prev.masteredWords

    const updated: UserProgress = {
      ...prev,
      wordsLearned,
      wordReviewCounts,
      masteredWords,
      bububuLevel:  computeLevel(wordsLearned),
      lastFedAt:    Date.now(),
      wordsToday:   wordsTodayAfter,
      lastFeedDate: today,
      ...updateStreak(prev),
    }
    setProgress(updated)

    return { isNew, wordsToday: wordsTodayAfter, justSatiated, overLimit, justMastered, reviewCount: newReviewCount }
  }, [])

  const setMode = useCallback((mode: AppMode) => {
    setProgress({ ...getProgress(), mode })
  }, [])

  const setDifficulty = useCallback((difficulty: DifficultyLevel) => {
    setProgress({ ...getProgress(), difficulty })
  }, [])

  const setUserName = useCallback((name: string) => {
    setProgress({ ...getProgress(), userName: name.trim() })
  }, [])

  const resetProgress = useCallback(() => {
    clearProgress()
    setProgress(loadProgress())
  }, [])

  const wordsUntilNextStage = computeWordsUntilNextStage(progress.wordsLearned)

  return { progress, computedLevel, levelProgress, dailyLimit, recordWord, setMode, setDifficulty, setUserName, resetProgress, wordsUntilNextStage }
}
