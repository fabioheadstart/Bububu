import type { VocabEntry, CEFRLevel, DifficultyLevel } from '@/types'
import { A1_WORDS } from './a1'
import { A2_WORDS } from './a2'
import { B1_WORDS } from './b1'

export const ALL_WORDS: VocabEntry[] = [...A1_WORDS, ...A2_WORDS, ...B1_WORDS]

export function getWordsByLevel(level: CEFRLevel): VocabEntry[] {
  return ALL_WORDS.filter(w => w.level === level)
}

export function getWordsByCategory(category: string): VocabEntry[] {
  return ALL_WORDS.filter(w => w.category === category)
}

/** Retorna o pool de vocabulário correspondente à dificuldade selecionada */
export function getWordsByDifficulty(difficulty: DifficultyLevel): VocabEntry[] {
  if (difficulty === 'easy')   return A1_WORDS
  if (difficulty === 'medium') return [...A1_WORDS, ...A2_WORDS]
  return ALL_WORDS
}

export const CATEGORIES = [...new Set(ALL_WORDS.map(w => w.category))].sort()
