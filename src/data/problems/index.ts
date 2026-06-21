import type { Problem, ProblemPhase, DifficultyLevel } from '@/types'
import { KIDS_PROBLEMS } from './kids'
import { EASY_PROBLEMS } from './easy'
import { MEDIUM_PROBLEMS } from './medium'
import { ADULT_PROBLEMS } from './adult'

export const ALL_PROBLEMS: Problem[] = [
  ...KIDS_PROBLEMS,
  ...EASY_PROBLEMS,
  ...MEDIUM_PROBLEMS,
  ...ADULT_PROBLEMS,
]

export function getRandomProblem(
  phase: ProblemPhase,
  difficulty: DifficultyLevel,
  excludeIds: string[] = [],
): Problem {
  // Kids: ignora difficulty — todos os problemas kids são adequados
  const byPhase = phase === 'kids'
    ? ALL_PROBLEMS.filter(p => p.phase === 'kids')
    : ALL_PROBLEMS.filter(p => p.phase === 'adult' && p.difficulty === difficulty)

  const pool = byPhase.filter(p => !excludeIds.includes(p.id))
  const source = pool.length > 0 ? pool : byPhase
  return source[Math.floor(Math.random() * source.length)]
}
