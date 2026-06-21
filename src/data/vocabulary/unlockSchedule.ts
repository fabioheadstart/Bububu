import { getWordsByDifficulty } from '@/data/vocabulary'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import type { VocabEntry, DifficultyLevel } from '@/types'

// ─── Unlock schedule (por nível de CEFR, não por categoria) ──────────────────
//
//  Todos os A1 (59 palavras) ficam disponíveis desde o level 1 para garantir
//  variedade. O desbloqueio progressivo acontece no salto de competência real:
//    Level 1-4  → pool A1 completo (59 palavras)
//    Level 5+   → + A2 (33 palavras) = 92
//    Level 10+  → + B1 (24 palavras) = 116
//
//  Isso preserva a sensação de "unlock" sem tornar o jogo repetitivo no início.

/** Returns the vocab pool visible to the user at their current level + difficulty. */
export function getUnlockedPool(level: number, difficulty: DifficultyLevel): VocabEntry[] {
  const all = getWordsByDifficulty(difficulty)

  if (difficulty === 'easy') {
    // Easy: A1 always, A2 unlocks at level 5, B1 at level 10
    return all.filter(w => {
      if (w.level === 'A1') return true
      if (w.level === 'A2') return level >= 5
      if (w.level === 'B1') return level >= 10
      return false
    })
  }

  // Medium/hard: all available from the start
  return all
}

/** Returns newly-unlocked CEFR level label when leveling up. */
export function getNewlyUnlockedCategories(prevLevel: number, newLevel: number): string[] {
  if (prevLevel >= newLevel) return []
  const unlocked: string[] = []
  if (prevLevel < 5  && newLevel >= 5)  unlocked.push('A2 — intermediário')
  if (prevLevel < 10 && newLevel >= 10) unlocked.push('B1 — avançado')
  return unlocked
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
