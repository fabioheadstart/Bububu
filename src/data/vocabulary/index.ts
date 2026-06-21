import type { VocabEntry, CEFRLevel, DifficultyLevel } from '@/types'
import { A1_WORDS } from './a1'
import { A2_WORDS } from './a2'
import { B1_WORDS } from './b1'
import { A1_EXTRA_WORDS } from './a1-extra'
import { A2_EXTRA_WORDS } from './a2-extra'
import { B1_EXTRA_WORDS } from './b1-extra'

const ALL_A1 = [...A1_WORDS, ...A1_EXTRA_WORDS]
const ALL_A2 = [...A2_WORDS, ...A2_EXTRA_WORDS]
const ALL_B1 = [...B1_WORDS, ...B1_EXTRA_WORDS]

export const ALL_WORDS: VocabEntry[] = [...ALL_A1, ...ALL_A2, ...ALL_B1]

export function getWordsByLevel(level: CEFRLevel): VocabEntry[] {
  return ALL_WORDS.filter(w => w.level === level)
}

export function getWordsByCategory(category: string): VocabEntry[] {
  return ALL_WORDS.filter(w => w.category === category)
}

/** Retorna o pool de vocabulário correspondente à dificuldade selecionada */
export function getWordsByDifficulty(difficulty: DifficultyLevel): VocabEntry[] {
  if (difficulty === 'easy')   return ALL_A1
  if (difficulty === 'medium') return [...ALL_A1, ...ALL_A2]
  return ALL_WORDS
}

export const CATEGORIES = [...new Set(ALL_WORDS.map(w => w.category))].sort()
