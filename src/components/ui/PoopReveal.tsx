import type { FeedResult } from '@/types'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import { ipaToBreading } from '@/lib/phonetics/ipaToBreading'

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

  // Cor da categoria para o bonus
  const catColor = getCategoryColor(entry.category)

  // Fonética brasuca — legível para brasileiro, não IPA cru
  const brasuca = ipaToBreading(entry.phonetic)

  // Frases têm fonte menor e wrap; palavras ficam grandes
  const isPhrase = entry.word.includes(' ')

  // Cores adaptadas ao tema
  const wordColor            = isKids ? '#2D1F6B'             : 'white'
  const phoneticColor        = isKids ? 'rgba(45,31,107,0.55)' : 'rgba(255,255,255,0.58)'
  const translationColor     = isKids ? '#E83A5E'             : '#fde68a'
  const exampleColor         = isKids ? '#444'                : 'rgba(255,255,255,0.88)'
  const exampleTransColor    = isKids ? '#777'                : 'rgba(255,255,255,0.45)'
  const reviewColor          = isKids ? 'rgba(45,31,107,0.45)' : 'rgba(255,255,255,0.35)'

  const xpColor  = isKids
    ? (isJackpot ? '#B45309' : '#E07000')
    : (isJackpot ? '#f59e0b' : isBonus ? catColor.ring : '#fbbf24')
  const xpBg     = isKids
    ? (isJackpot ? 'rgba(255,159,67,0.18)' : 'rgba(255,159,67,0.12)')
    : (isJackpot ? 'rgba(245,158,11,0.15)' : isBonus ? `${catColor.bg}22` : 'rgba(251,191,36,0.10)')
  const xpBorder = isKids
    ? `1px solid rgba(255,159,67,0.35)`
    : `1px solid ${isJackpot ? 'rgba(245,158,11,0.45)' : isBonus ? `${catColor.ring}66` : 'rgba(251,191,36,0.25)'}`

  // Animação de entrada por tier
  const entryAnim = isJackpot
    ? 'reveal-jackpot 0.52s cubic-bezier(0.34,1.56,0.64,1)'
    : isBonus
      ? 'reveal-bonus 0.40s cubic-bezier(0.34,1.56,0.64,1)'
      : 'fadeSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      padding: isKids ? '8px 16px 6px' : '4px 16px 2px',
      animation: entryAnim,
    }}>

      {/* ── Linha 1: [espaço 💩] palavra · fonética · badge ── */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 7,
        width: '100%',
        justifyContent: 'center',
        paddingLeft: isPhrase ? 0 : 36,
      }}>
        <span style={{
          fontSize: isPhrase
            ? (entry.word.length > 22 ? 15 : 17)
            : isKids ? 22 : (isJackpot ? 24 : isBonus ? 23 : 21),
          fontWeight: 900,
          color: isJackpot ? '#fde68a' : isBonus ? catColor.ring : wordColor,
          letterSpacing: isPhrase ? 0.1 : -0.5,
          lineHeight: 1.25,
          textAlign: 'center',
          textShadow: isJackpot
            ? '0 0 20px rgba(251,191,36,0.6)'
            : isBonus
              ? `0 0 14px ${catColor.glow}`
              : 'none',
        }}>
          {entry.word}
        </span>

        <span style={{
          fontSize: 13,
          color: phoneticColor,
          letterSpacing: 0.8,
          fontWeight: 500,
        }}>
          {brasuca}
        </span>

        {!isReview && (
          <span style={{
            fontSize: 10, fontWeight: 800,
            color: xpColor, background: xpBg, border: xpBorder,
            padding: '1px 7px', borderRadius: 99, whiteSpace: 'nowrap',
            animation: isJackpot
              ? 'jackpot-xp-pulse 1.2s ease-in-out 0.3s infinite'
              : isBonus
                ? 'bonus-xp-pulse 1.4s ease-in-out 0.2s infinite'
                : undefined,
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

      {/* ── Linha 2: badge de status ── */}
      {isJackpot ? (
        <div style={{
          fontSize: 11, fontWeight: 900, letterSpacing: 2,
          color: '#f59e0b',
          marginTop: 7,
          textAlign: 'center',
          textTransform: 'uppercase',
          textShadow: '0 0 16px rgba(245,158,11,0.8)',
          animation: 'jackpot-badge 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
        }}>
          🎰 jackpot!
        </div>
      ) : isBonus ? (
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
          color: catColor.ring,
          marginTop: 6,
          textAlign: 'center',
          textTransform: 'uppercase',
          textShadow: `0 0 12px ${catColor.glow}`,
          animation: 'bonus-badge 0.38s cubic-bezier(0.34,1.56,0.64,1) 0.08s both',
        }}>
          ✨ {catColor.label || entry.category}
        </div>
      ) : (
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
      )}

      {/* ── Tradução ── */}
      <div style={{
        fontSize: isPhrase
          ? (entry.translation.length > 25 ? 18 : 22)
          : isKids ? 28 : (isJackpot ? 38 : isBonus ? 33 : 30),
        fontWeight: 900,
        color: isBonus ? catColor.ring : translationColor,
        letterSpacing: -1,
        lineHeight: 1,
        textAlign: 'center',
        marginTop: isJackpot ? 4 : 2,
        textShadow: isJackpot
          ? '0 0 30px rgba(251,191,36,0.75), 0 2px 8px rgba(0,0,0,0.5)'
          : isBonus
            ? `0 0 16px ${catColor.glow}`
            : 'none',
        animation: isJackpot
          ? 'jackpot-translation 0.45s ease 0.18s both'
          : isBonus
            ? 'reveal-bonus 0.38s ease 0.12s both'
            : undefined,
      }}>
        {entry.translation}
      </div>

      {/* ── Card de contexto — sempre visível, destaque varia por tier ── */}
      <div style={{
        marginTop: 10,
        width: '100%',
        maxWidth: 310,
        position: 'relative',
        background: isBonus
          ? (isKids ? 'rgba(255,255,255,0.60)' : `${catColor.bg}20`)
          : (isKids ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.06)'),
        border: `1.5px solid ${isBonus
          ? (isKids ? catColor.ring + '66' : catColor.ring + '55')
          : (isKids ? 'rgba(45,31,107,0.14)' : 'rgba(255,255,255,0.10)')}`,
        borderRadius: 14,
        padding: '11px 14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        animation: 'fadeSlideUp 0.42s ease 0.45s both',
        boxShadow: isBonus
          ? (isKids ? '0 2px 10px rgba(0,0,0,0.07)' : `0 2px 12px ${catColor.bg}30`)
          : 'none',
      }}>
        {/* Badge ✨ bônus — canto superior direito, só quando bonus */}
        {isBonus && (
          <span style={{
            position: 'absolute', top: 8, right: 10,
            fontSize: 9, fontWeight: 900,
            color: catColor.ring, letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>✨ bônus</span>
        )}

        {/* Frase em inglês — protagonista */}
        <div style={{
          fontSize: isKids ? 15 : 16,
          color: isBonus
            ? (isKids ? '#2D1F6B' : '#e9d5ff')
            : exampleColor,
          fontWeight: isBonus ? 700 : 600,
          lineHeight: 1.45,
          paddingRight: isBonus ? 52 : 0,   // espaço pro badge
        }}>
          {entry.exampleSentence}
        </div>

        {/* Tradução — 14px, contraste real */}
        <div style={{
          fontSize: isKids ? 13 : 14,
          color: isBonus
            ? (isKids ? 'rgba(45,31,107,0.65)' : 'rgba(196,181,253,0.75)')
            : (isKids ? 'rgba(45,31,107,0.55)' : 'rgba(255,255,255,0.58)'),
          lineHeight: 1.45,
          fontWeight: 500,
        }}>
          {entry.exampleTranslation}
        </div>
      </div>

    </div>
  )
}
