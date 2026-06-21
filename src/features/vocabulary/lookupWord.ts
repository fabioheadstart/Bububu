import { ALL_WORDS } from '@/data/vocabulary/index'
import type { VocabEntry } from '@/types'

export function lookupWord(input: string): VocabEntry | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  return ALL_WORDS.find(e => e.word.toLowerCase() === normalized) ?? null
}

export function suggestWords(input: string, limit = 5): VocabEntry[] {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return []
  return ALL_WORDS
    .filter(e => e.word.toLowerCase().startsWith(normalized))
    .slice(0, limit)
}
