import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import type { VocabEntry } from '@/types'

interface Props {
  queue: VocabEntry[]          // 0–4 entries in order
  onRemove: (index: number) => void
  onSend: () => void
  disabled: boolean
}

export function SentenceBar({ queue, onRemove, onSend, disabled }: Props) {
  const full = queue.length === 4

  return (
    <>
      <style>{`
        @keyframes slot-fill {
          0%   { transform: scale(0.55) translateY(6px); opacity: 0; filter: brightness(2); }
          60%  { transform: scale(1.10) translateY(-2px); opacity: 1; filter: brightness(1.3); }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1); }
        }
        @keyframes send-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5), 0 4px 16px rgba(124,58,237,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(124,58,237,0), 0 4px 24px rgba(124,58,237,0.7); }
        }
        @keyframes bar-slide-in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px 6px',
        animation: 'bar-slide-in 0.22s ease',
      }}>

        {/* Label */}
        <div style={{
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          fontWeight: 800,
          color: 'rgba(196,181,253,0.60)',
        }}>
          monte sua frase
        </div>

        {/* Slots row */}
        <div style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
        }}>
          {Array.from({ length: 4 }).map((_, i) => {
            const entry = queue[i]
            const color = entry ? getCategoryColor(entry.category) : null

            return (
              <div
                key={i}
                onClick={() => entry && !disabled && onRemove(i)}
                style={{
                  flex: 1,
                  minHeight: 38,
                  maxWidth: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  border: entry
                    ? `1.5px solid ${color!.ring}55`
                    : '1.5px dashed rgba(196,181,253,0.25)',
                  background: entry
                    ? `${color!.bg}cc`
                    : 'rgba(255,255,255,0.03)',
                  cursor: entry && !disabled ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                  animation: entry ? 'slot-fill 0.36s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
                }}
              >
                {entry ? (
                  <>
                    {/* Número do slot (canto superior esquerdo) */}
                    <span style={{
                      position: 'absolute',
                      top: 2, left: 5,
                      fontSize: 9,
                      fontWeight: 900,
                      color: color!.ring,
                      opacity: 0.8,
                      lineHeight: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: 0.2,
                      textShadow: `0 1px 4px ${color!.glow}`,
                      textAlign: 'center',
                      padding: '0 4px',
                    }}>
                      {entry.word}
                    </span>
                    {/* X de remover */}
                    <span style={{
                      position: 'absolute',
                      top: 2, right: 4,
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1,
                    }}>
                      ✕
                    </span>
                  </>
                ) : (
                  <span style={{
                    fontSize: 18,
                    color: 'rgba(196,181,253,0.18)',
                    fontWeight: 300,
                    userSelect: 'none',
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
            )
          })}

          {/* Botão Mandar */}
          <button
            onClick={onSend}
            disabled={queue.length < 2 || disabled}
            style={{
              flexShrink: 0,
              padding: '0 14px',
              minHeight: 38,
              borderRadius: 10,
              border: 'none',
              background: full
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : queue.length >= 2
                  ? 'rgba(124,58,237,0.55)'
                  : 'rgba(255,255,255,0.06)',
              color: queue.length >= 2 ? '#fff' : 'rgba(255,255,255,0.25)',
              fontSize: 13,
              fontWeight: 900,
              cursor: queue.length >= 2 && !disabled ? 'pointer' : 'default',
              transition: 'background 0.2s, transform 0.1s',
              animation: full ? 'send-pulse 1.2s ease-in-out infinite' : undefined,
              WebkitTapHighlightColor: 'transparent',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
            }}
          >
            {full ? '🚀 Mandar!' : '→'}
          </button>
        </div>
      </div>
    </>
  )
}
