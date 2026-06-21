import { getWordsByDifficulty } from '@/data/vocabulary'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import type { VocabEntry, DifficultyLevel } from '@/types'

// ─── Unlock schedule (easy / A1) ─────────────────────────────────────────────
//
//  A1 total = 59 words across 8 categories:
//    food(10), actions(10), adjectives(8), home(7), body(7), time(6), family(6), transport(5)
//
//  Level thresholds (from computeLevel in useProgress):
//    L1 = 0-11 words   L2 = 12-23   L3 = 24-35   L4 = 36-47   L5 = 48-59
//
//  Pool must always be ≥ threshold to level up:
//    L1 pool = food+body       = 17  ✓ (need 12 to reach L2)
//    L2 pool = +family+time    = 29  ✓ (need 24)
//    L3 pool = +actions        = 39  ✓ (need 36)
//    L4 pool = +home+adj       = 54  ✓ (need 48)
//    L5 pool = +transport      = 59  ✓ (all A1)
//
const A1_UNLOCK: { fromLevel: number; categories: string[] }[] = [
  { fromLevel: 1, categories: ['food', 'body'] },
  { fromLevel: 2, categories: ['family', 'time'] },
  { fromLevel: 3, categories: ['actions'] },
  { fromLevel: 4, categories: ['home', 'adjectives'] },
  { fromLevel: 5, categories: ['transport'] },
]

/** Returns the vocab pool visible to the user at their current level + difficulty. */
export function getUnlockedPool(level: number, difficulty: DifficultyLevel): VocabEntry[] {
  const all = getWordsByDifficulty(difficulty)

  // Medium/hard users are already experienced — full pool from the start
  if (difficulty !== 'easy') return all

  // Easy: progressively unlock A1 categories
  const unlocked = new Set<string>()
  for (const { fromLevel, categories } of A1_UNLOCK) {
    if (level >= fromLevel) categories.forEach(c => unlocked.add(c))
  }

  const filtered = all.filter(w => unlocked.has(w.category))
  // Safety fallback: if pool is somehow empty, return all
  return filtered.length > 0 ? filtered : all
}

/** Returns newly-unlocked category names when leveling from prevLevel → newLevel. */
export function getNewlyUnlockedCategories(prevLevel: number, newLevel: number): string[] {
  if (prevLevel >= newLevel) return []

  const prev = new Set<string>()
  const next = new Set<string>()

  for (const { fromLevel, categories } of A1_UNLOCK) {
    if (prevLevel >= fromLevel) categories.forEach(c => prev.add(c))
    if (newLevel  >= fromLevel) categories.forEach(c => next.add(c))
  }

  return [...next].filter(c => !prev.has(c))
}

/** Category badge data for LevelUpOverlay. */
export function getCategoryBadges(categories: string[]) {
  return categories.map(cat => ({
    cat,
    color: getCategoryColor(cat),
  }))
}

// ─── Tutorial chips (first session) ──────────────────────────────────────────
//
//  First 3 chips are curated to guarantee a Trio on the 3rd feed:
//  banana → juice → milk (all "food"). Teaches Semantic Trio organically.
//
const TUTORIAL_WORDS = ['banana', 'juice', 'milk']

export function getTutorialChips(pool: VocabEntry[]): VocabEntry[] | null {
  const chips = TUTORIAL_WORDS
    .map(word => pool.find(w => w.word === word))
    .filter((w): w is VocabEntry => w !== undefined)
  return chips.length === 3 ? chips : null
}
