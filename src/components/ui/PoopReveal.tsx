import type { FeedResult } from '@/types'

interface Props {
  result: FeedResult
  isReview: boolean
  isBurp?: boolean
  isKids?: boolean
  justMastered?: boolean
}

export function PoopReveal({ result, isReview, isBurp, isKids = false, justMastered = false }: Props) {
  const { entry, rewardTier, xpGained } = result

  const isJackpot = rewardTier === 'jackpot'
  const isBonus   = rewardTier === 'context_bonus'

  // Cores adaptadas ao tema
  const wordColor        = isKids ? '#2D1F6B'        : 'white'
  const phoneticColor    = isKids ? 'rgba(45,31,107,0.45)' : 'rgba(255,255,255,0.38)'
  const translationColor = isKids ? '#E83A5E'        : '#fde68a'
  const exampleColor     = isKids ? '#555'           : 'rgba(255,255,255,0.62)'
  const reviewColor      = isKids ? 'rgba(45,31,107,0.45)' : 'rgba(255,255,255,0.35)'

  const xpColor  = isKids
    ? (isJackpot ? '#B45309' : '#E07000')
    : (isJackpot ? '#f59e0b' : isBonus ? '#c4b5fd' : '#fbbf24')
  const xpBg     = isKids
    ? (isJackpot ? 'rgba(255,159,67,0.18)' : 'rgba(255,159,67,0.12)')
    : (isJackpot ? 'rgba(245,158,11,0.15)' : 'rgba(251,191,36,0.10)')
  const xpBorder = isKids
    ? `1px solid rgba(255,159,67,0.35)`
    : `1px solid ${isJackpot ? 'rgba(245,158,11,0.45)' : 'rgba(251,191,36,0.25)'}`

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      padding: isKids ? '8px 16px 6px' : '4px 16px 2px',
      animation: 'fadeSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>

      {/* ── Linha 1: [espaço 💩] palavra · fonética · badge ── */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 7,
        width: '100%',
        justifyContent: 'center',
        paddingLeft: 36,
      }}>
        <span style={{
          fontSize: isKids ? 22 : 21,
          fontWeight: 900,
          color: wordColor,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}>
          {entry.word}
        </span>

        <span style={{ fontSize: 12, color: phoneticColor, letterSpacing: 0.1 }}>
          {entry.phonetic}
        </span>

        {!isReview && (
          <span style={{
            fontSize: 10, fontWeight: 800,
            color: xpColor, background: xpBg, border: xpBorder,
            padding: '1px 7px', borderRadius: 99, whiteSpace: 'nowrap',
          }}>
            +{xpGained} XP{isJackpot ? ' 🎰' : isBonus ? ' ✨' : ''}
          </span>
        )}
        {isReview && (
          <span style={{ fontSize: 10, color: reviewColor }}>review 👏</span>
        )}
        {isBurp && (
          <span style={{
            fontSize: 10, fontWeight: 800, color: '#fbbf24',
            background: 'rgba(251,191,36,0.15)', padding: '1px 7px', borderRadius: 99,
          }}>BURP! 🫧</span>
        )}
      </div>

      {/* ── Linha 2: badge + tradução ── */}
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.6,
        color: justMastered
          ? (isKids ? '#b45309' : '#fbbf24')
          : (isKids ? 'rgba(45,31,107,0.28)' : 'rgba(255,255,255,0.22)'),
        marginTop: 6,
        textAlign: 'center',
        animation: justMastered ? 'fadeSlideUp 0.4s ease' : undefined,
      }}>
        {justMastered ? 'dominada ⭐' : 'digerido ✓'}
      </div>
      <div style={{
        fontSize: isKids ? 28 : 30,
        fontWeight: 900,
        color: translationColor,
        letterSpacing: -1,
        lineHeight: 1,
        textAlign: 'center',
        marginTop: 2,
      }}>
        {entry.translation}
      </div>

      {/* ── Linha 3: exemplo ── */}
      <div style={{
        fontSize: 13,
        color: exampleColor,
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 1.4,
        marginTop: 5,
        animation: 'fadeSlideUp 0.4s ease 0.55s both',
      }}>
        "{entry.exampleSentence}"
      </div>

    </div>
  )
}
