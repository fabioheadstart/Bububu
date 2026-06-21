import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import type { VocabEntry } from '@/types'

interface Props {
  chips: VocabEntry[]
  onSelect: (entry: VocabEntry, rect: DOMRect) => void
  disabled: boolean
  flyingId: string | null
  isKids?: boolean
  hintIds?: Set<string>
  konamiHintId?: string | null
}

export function WordChips({
  chips, onSelect, disabled, flyingId,
  isKids = false, hintIds, konamiHintId,
}: Props) {
  return (
    <>
      <style>{`
        @keyframes hint-ring {
          0%, 100% { box-shadow: var(--chip-glow), 0 0 0 2px var(--chip-ring), 0 0 12px var(--chip-ring); }
          50%       { box-shadow: var(--chip-glow), 0 0 0 4px var(--chip-ring), 0 0 22px var(--chip-ring); }
        }
        @keyframes konami-sparkle {
          0%,100% { opacity: 0.45; transform: scale(0.85); }
          50%     { opacity: 0.90; transform: scale(1.10); }
        }
      `}</style>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {chips.map((entry) => {
          const isFlying   = entry.id === flyingId
          const isHinted   = hintIds?.has(entry.id) ?? false
          const isKonami   = konamiHintId === entry.id
          const color      = getCategoryColor(entry.category)

          const baseShadow = `0 4px 14px ${color.glow}, 0 2px 0 rgba(0,0,0,0.14)`

          return (
            <button
              key={entry.id}
              onClick={(e) => {
                if (!disabled) onSelect(entry, e.currentTarget.getBoundingClientRect())
              }}
              disabled={disabled}
              style={{
                position: 'relative',
                padding: isKids ? '14px 24px' : '13px 22px',
                fontSize: isKids ? 18 : 17,
                fontWeight: 800,
                borderRadius: 999,
                border: 'none',
                background: isFlying ? `${color.bg}22` : color.bg,
                color: isFlying ? 'transparent' : 'white',
                cursor: disabled ? 'default' : 'pointer',
                boxShadow: isFlying ? 'none' : baseShadow,
                opacity: isFlying ? 0 : disabled && flyingId !== null ? 0.45 : 1,
                transition: 'opacity 0.1s ease, background 0.1s ease, transform 0.1s ease',
                animation: isHinted && !isFlying && !disabled
                  ? 'hint-ring 1.1s ease-in-out infinite'
                  : !isFlying && !disabled
                    ? 'chip-bounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                // CSS vars usadas pela animação hint-ring
                ['--chip-glow' as string]: baseShadow,
                ['--chip-ring' as string]: color.ring,
              } as React.CSSProperties}
              onPointerEnter={e => {
                if (!disabled && !isFlying) e.currentTarget.style.transform = 'scale(1.06)'
              }}
              onPointerLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {entry.word}

              {/* Konami hint: ✨ sutil no canto superior direito */}
              {isKonami && !isFlying && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -2,
                    fontSize: 11,
                    pointerEvents: 'none',
                    animation: 'konami-sparkle 1.4s ease-in-out infinite',
                  }}
                >
                  ✨
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
