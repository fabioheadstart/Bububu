import { useAudio } from '@/lib/audio/useAudio'
import type { FeedResult } from '@/types'

interface Props {
  result: FeedResult
  isReview?: boolean
}

const TIER_LABEL: Record<string, string | null> = {
  normal: null,
  context_bonus: '✨ Context bonus!',
  jackpot: '🎰 Jackpot!',
}

const TIER_COLOR: Record<string, string> = {
  normal: '#444',
  context_bonus: '#b45309',
  jackpot: '#7c3aed',
}

export function RewardDisplay({ result, isReview = false }: Props) {
  const { entry, rewardTier, xpGained } = result
  const { speakWord, speakSentence, isPlaying } = useAudio()

  const tierLabel = TIER_LABEL[rewardTier]
  const tierColor = TIER_COLOR[rewardTier]

  return (
    <div style={{
      width: '100%',
      maxWidth: 360,
      borderRadius: 16,
      padding: '20px 24px',
      background: '#fff',
      boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: 'fadeSlideUp 0.3s ease',
      opacity: isReview ? 0.85 : 1,
    }}>
      {/* Word + phonetic + pronúncia */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 800 }}>{entry.word}</span>
        <span style={{ fontSize: 15, color: '#888', flex: 1 }}>{entry.phonetic}</span>
        <button
          onClick={() => speakWord(entry.word)}
          disabled={isPlaying}
          title="Pronounce word"
          style={{
            background: 'none',
            border: '2px solid #e0d7ff',
            borderRadius: 8,
            padding: '4px 8px',
            cursor: isPlaying ? 'default' : 'pointer',
            fontSize: 16,
            opacity: isPlaying ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          🔊
        </button>
      </div>

      {/* Tradução */}
      <div style={{ fontSize: 18, color: '#333' }}>
        🇧🇷 <strong>{entry.translation}</strong>
      </div>

      {/* Frase de exemplo + pronúncia */}
      <div style={{
        fontSize: 14, color: '#555',
        borderLeft: '3px solid #e0d7ff', paddingLeft: 12,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <div>
            <div style={{ fontStyle: 'italic' }}>"{entry.exampleSentence}"</div>
            <div style={{ color: '#888', marginTop: 2 }}>{entry.exampleTranslation}</div>
          </div>
          <button
            onClick={() => speakSentence(entry.exampleSentence)}
            disabled={isPlaying}
            title="Hear sentence"
            style={{
              background: 'none', border: 'none',
              cursor: isPlaying ? 'default' : 'pointer',
              fontSize: 13, opacity: isPlaying ? 0.4 : 0.6,
              paddingTop: 2, flexShrink: 0,
            }}
          >
            🔊
          </button>
        </div>
      </div>

      {/* Reward tier + XP (oculto em revisão — sem recompensa extra) */}
      {!isReview && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {tierLabel
            ? <span style={{ fontWeight: 700, color: tierColor }}>{tierLabel}</span>
            : <span />
          }
          <span style={{
            fontSize: 13, fontWeight: 600, color: '#7c3aed',
            background: '#f3eeff', padding: '4px 10px', borderRadius: 99,
          }}>
            +{xpGained} XP
          </span>
        </div>
      )}

      {!isReview && rewardTier === 'context_bonus' && (
        <div style={{ fontSize: 13, color: '#92400e', background: '#fffbeb', borderRadius: 8, padding: '8px 12px' }}>
          💡 <strong>Tip:</strong> "{entry.word}" is often used in the phrase: <em>"{entry.exampleSentence}"</em>
        </div>
      )}
      {!isReview && rewardTier === 'jackpot' && (
        <div style={{ fontSize: 13, color: '#5b21b6', background: '#f5f3ff', borderRadius: 8, padding: '8px 12px' }}>
          🌟 <strong>Level up!</strong> You just learned a word that native speakers use every day.
        </div>
      )}
    </div>
  )
}
