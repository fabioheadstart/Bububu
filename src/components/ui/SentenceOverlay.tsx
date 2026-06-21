import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import type { VocabEntry } from '@/types'

interface Props {
  words: VocabEntry[]          // os 4 (ou mais) chips na ordem escolhida
  totalXp: number
  onDone: () => void
}

export function SentenceOverlay({ words, totalXp, onDone }: Props) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showXp,      setShowXp]       = useState(false)
  const [showButton,  setShowButton]   = useState(false)

  // Revela as palavras uma por uma (sincroniza com a fala do ElevenLabs em FeedScreen)
  useEffect(() => {
    let i = 0
    function next() {
      if (i >= words.length) {
        setTimeout(() => setShowXp(true),     200)
        setTimeout(() => setShowButton(true), 700)
        return
      }
      setVisibleCount(i + 1)
      i++
      setTimeout(next, 520)
    }
    const t = setTimeout(next, 180)
    return () => clearTimeout(t)
  }, [words.length])

  return createPortal(
    <>
      <style>{`
        @keyframes sentence-overlay-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes sentence-sheet-in {
          0%   { transform: translateY(60px) scale(0.95); opacity: 0; }
          60%  { transform: translateY(-6px) scale(1.01); opacity: 1; }
          80%  { transform: translateY(2px) scale(0.99); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes word-card-in {
          0%   { opacity: 0; transform: scale(0.6) translateY(12px); filter: brightness(2.5); }
          55%  { opacity: 1; transform: scale(1.08) translateY(-3px); filter: brightness(1.3); }
          75%  { transform: scale(0.97) translateY(0); filter: brightness(1.05); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
        }
        @keyframes xp-count-in {
          0%   { opacity: 0; transform: scale(0.4) translateY(10px); }
          65%  { opacity: 1; transform: scale(1.15) translateY(-3px); }
          85%  { transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes star-spin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes sentence-btn-in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={showButton ? onDone : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(7,1,26,0.85)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 16px 20px',
          animation: 'sentence-overlay-in 0.2s ease',
        }}
      >
        {/* Sheet */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 440,
            background: 'rgba(18,6,46,0.97)',
            border: '1px solid rgba(167,139,250,0.30)',
            borderRadius: 24,
            padding: '24px 20px 28px',
            animation: 'sentence-sheet-in 0.42s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 -12px 60px rgba(124,58,237,0.30)',
          }}
        >
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 32, marginBottom: 4, animation: 'star-spin 2s linear infinite' }}>✨</div>
            <div style={{
              fontSize: 22, fontWeight: 900,
              color: '#e9d5ff',
              letterSpacing: 0.5,
              textShadow: '0 0 20px rgba(167,139,250,0.6)',
            }}>
              Sua frase!
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(196,181,253,0.55)',
              marginTop: 4,
              letterSpacing: 0.3,
            }}>
              {words.length} palavra{words.length !== 1 ? 's' : ''} • você escolheu a ordem
            </div>
          </div>

          {/* Chips em linha (ou 2×2 se 4 chips) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            {words.map((entry, i) => {
              const color   = getCategoryColor(entry.category)
              const visible = i < visibleCount
              return (
                <div
                  key={entry.id}
                  style={{
                    opacity: visible ? 1 : 0,
                    animation: visible ? 'word-card-in 0.40s cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
                    background: `linear-gradient(145deg, ${color.bg}ee, ${color.bg}cc)`,
                    border: `1.5px solid ${color.ring}55`,
                    borderRadius: 14,
                    padding: '12px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: `0 4px 16px ${color.glow}`,
                    minWidth: 80,
                  }}
                >
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    color: color.ring,
                    opacity: 0.7,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#fff',
                    textShadow: `0 2px 8px ${color.glow}`,
                    letterSpacing: 0.3,
                  }}>
                    {entry.word}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: 0.2,
                  }}>
                    {entry.translation}
                  </span>
                </div>
              )
            })}
          </div>

          {/* XP total */}
          {showXp && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 18,
              animation: 'xp-count-in 0.42s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.20), rgba(245,158,11,0.10))',
                border: '1.5px solid rgba(251,191,36,0.45)',
                borderRadius: 999,
                padding: '10px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(251,191,36,0.25)',
              }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <span style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#fbbf24',
                  textShadow: '0 0 16px rgba(251,191,36,0.6)',
                  letterSpacing: 0.5,
                }}>
                  +{totalXp} XP
                </span>
              </div>
            </div>
          )}

          {/* Botão fechar */}
          {showButton && (
            <button
              onClick={onDone}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                letterSpacing: 0.5,
                boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
                WebkitTapHighlightColor: 'transparent',
                animation: 'sentence-btn-in 0.3s ease',
              }}
            >
              Incrível! 🎉
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
