import type { RewardTier } from '@/types'

/**
 * Slot de reforço variável.
 * Distribuição: 70% normal | 20% context_bonus | 10% jackpot
 * Toda tier carrega valor pedagógico — nunca é só estética.
 */
export function rollRewardTier(): RewardTier {
  const roll = Math.random()
  if (roll < 0.70) return 'normal'
  if (roll < 0.90) return 'context_bonus'
  return 'jackpot'
}

export const XP_BY_TIER: Record<RewardTier, number> = {
  normal: 10,
  context_bonus: 25,   // acompanha frase extra em contexto real
  jackpot: 50,         // acompanha mini-diálogo ou uso avançado
}
