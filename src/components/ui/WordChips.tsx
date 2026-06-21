import { KIDS_CHIP_COLORS } from '@/hooks/useTheme'
import type { VocabEntry } from '@/types'

interface Props {
  chips: VocabEntry[]
  onSelect: (entry: VocabEntry, rect: DOMRect) => void
  disabled: boolean
  flyingId: string | null
  isKids?: boolean
}

export function WordChips({ chips, onSelect, disabled, flyingId, isKids = false }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {chips.map((entry, idx) => {
        const isFlying = entry.id === flyingId
        const candy    = KIDS_CHIP_COLORS[idx % KIDS_CHIP_COLORS.length]

        const bg     = isKids ? (isFlying ? `${candy.bg}22` : candy.bg) : (isFlying ? 'rgba(124,58,237,0.15)' : '#7c3aed')
        const shadow = isKids ? (isFlying ? 'none' : `0 4px 14px ${candy.shadow}, 0 2px 0 rgba(0,0,0,0.12)`) : (isFlying ? 'none' : '0 4px 14px rgba(124,58,237,0.38)')

        return (
          <button
            key={entry.id}
            onClick={(e) => { if (!disabled) onSelect(entry, e.currentTarget.getBoundingClientRect()) }}
            disabled={disabled}
            style={{
              padding: isKids ? '14px 24px' : '13px 22px',
              fontSize: isKids ? 18 : 17,
              fontWeight: 800,
              borderRadius: 999,
              border: 'none',
              background: bg,
              color: isFlying ? 'transparent' : 'white',
              cursor: disabled ? 'default' : 'pointer',
              boxShadow: shadow,
              opacity: isFlying ? 0 : disabled && flyingId !== null ? 0.45 : 1,
              transition: 'opacity 0.1s ease, background 0.1s ease, transform 0.1s ease',
              animation: !isFlying && !disabled ? 'chip-bounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              transform: isKids && !isFlying && !disabled ? 'scale(1)' : undefined,
              textShadow: isKids ? '0 1px 2px rgba(0,0,0,0.18)' : 'none',
            }}
            onPointerEnter={e => { if (isKids && !disabled && !isFlying) e.currentTarget.style.transform = 'scale(1.06)' }}
            onPointerLeave={e => { if (isKids) e.currentTarget.style.transform = 'scale(1)' }}
          >
            {entry.word}
          </button>
        )
      })}
    </div>
  )
}
