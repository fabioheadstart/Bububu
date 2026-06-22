// ─── Modos ────────────────────────────────────────────────────────────────────
export type AppMode = 'kids' | 'pro'

// ─── Dificuldade ──────────────────────────────────────────────────────────────
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// ─── CEFR / Vocabulário ───────────────────────────────────────────────────────
export type CEFRLevel = 'A1' | 'A2' | 'B1'

export interface VocabEntry {
  id: string
  word: string
  translation: string       // pt-BR
  phonetic: string          // IPA
  audioUrl?: string
  level: CEFRLevel
  category: string
  exampleSentence: string
  exampleTranslation: string
}

// ─── Reforço variável ─────────────────────────────────────────────────────────
export type RewardTier = 'normal' | 'context_bonus' | 'jackpot'

export interface FeedResult {
  entry: VocabEntry
  rewardTier: RewardTier
  xpGained: number
}

// ─── Usuário ──────────────────────────────────────────────────────────────────
export const MASTERY_THRESHOLD = 3  // reviews necessários para dominar uma palavra

export interface UserProgress {
  userId: string
  userName?: string            // nome escolhido no onboarding
  mode: AppMode
  difficulty: DifficultyLevel  // conteúdo: easy=A1 | medium=A1+A2 | hard=tudo
  bububuLevel: number          // = competência real, nunca XP inflado
  wordsLearned: string[]       // VocabEntry ids — vistos ao menos 1x
  wordReviewCounts: Record<string, number>  // id → nº de reviews após o 1º encontro
  masteredWords: string[]      // ids com reviewCount >= MASTERY_THRESHOLD
  streak: number               // dias consecutivos (Pro: real | Kids: nunca punitivo)
  lastSessionDate: string      // ISO date
  lastFedAt: number            // timestamp ms — quando última palavra foi alimentada
  wordsToday: number           // palavras alimentadas hoje (reset à meia-noite)
  lastFeedDate: string         // ISO date — para detectar virada de dia
}

// ─── Limite diário de apetite ─────────────────────────────────────────────────
export const DAILY_LIMIT: Record<AppMode, number> = {
  kids: 15,
  pro:  20,
}

// ─── Challenge / Problemas situacionais ──────────────────────────────────────
export type ProblemPhase = 'kids' | 'adult'
export type OptionScore = 'high' | 'medium'

export interface ProblemOption {
  key: 'A' | 'B'
  text: string        // inglês americano
  score: OptionScore
}

export interface Problem {
  id: string
  phase: ProblemPhase
  difficulty: DifficultyLevel  // easy | medium | hard
  category: string
  situation: string            // português
  options: [ProblemOption, ProblemOption]
  hint: string                 // português — por que B é melhor
}

export interface ChallengeResult {
  problem: Problem