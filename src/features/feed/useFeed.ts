import { useState, useCallback } from 'react'
import { rollRewardTier, XP_BY_TIER } from '@/features/rewards/rewardEngine'
import type { VocabEntry, FeedResult } from '@/types'

export function useFeed() {
  const [lastResult, setLastResult] = useState<FeedResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const feedWord = useCallback(async (entry: VocabEntry, overrideTier?: RewardTier) => {
    setIsLoading(true)
    // TODO: integrar com API de pronúncia
    const rewardTier = overrideTier ?? rollRewardTier()
    const result: FeedResult = {
      entry,
      rewardTier,
      xpGained: XP_BY_TIER[rewardTier],
    }
    setLastResult(result)
    setIsLoading(false)
    return result
  }, [])

  return { feedWord, lastResult, isLoading }
}
