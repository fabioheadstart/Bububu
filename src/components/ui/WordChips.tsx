import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import { playChipTap, hapticTap } from '@/lib/audio/sounds'
import type { VocabEntry } from '@/types'

interface Props {
  chips: VocabEntry[]
  onSelect: (entry: VocabEntry, rect: DOMRect) => void
  disabled: boolean
  flyingId: string | null
  isKids?: boolean
  hintIds?: Set<string>
  konamiHintId?: string | null
  reviewIds?: Set<string>
  masteredIds?: Set<string>
  newChipId?: string | null
  cravingCategory?: string | null
}

// Emoji pequeno que aparece dentro do chip, baseado na categoria
const CATEGORY_EMOJI: Record<string, string> = {
  food:       '🍪',
  actions:    '⚡',
  adjectives: '🌀',
  body:       '💪',
  family:     '🏠',
  home:       '🏠',
  time:       '⏰',
  transport:  '🚗',
  animals:    '🐾',
  nature:     '🌿',
  work:       '💼',
  play:       '🎮',
  school:     '✏️',
  friends:    '👋',
  travel:     '✈️',
  games:      '🎮',
  phrases:    '💬',
}

// Tilt derivado do id da palavra — determinístico, ±3.5°
function getTilt(id: string, index: number): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), index * 7)
  return ((hash % 7) - 3) * 0.9   // -2.7 a +2.7 deg
}

// Border-radius estilo "comida" por posição — alterna entre formas
const FOOD_RADII = [
  '22px 20px 20px 22px',   // 0: levemente assimétrico — biscoito
  '18px 22px 22px 18px',   // 1: assimétrico inverso — linguiça
  '24px',                  // 2: redondo — queijo bolinha
  '16px 20px 20px 16px',   // 3: cantos variados — bolacha quadrada
]

// Gradiente 3D — claro em cima, escuro embaixo, como um objeto sob luz
function chipGradient(bg: string): string {
  return `linear-gradient(165deg, ${bg}ee 0%, ${bg} 38%, ${bg}cc 100%)`
}

export function WordChips({
  chips, onSelect, disabled, flyingId,
  isKids = false, hintIds, konamiHintId,
  reviewIds, masteredIds, newChipId, cravingCategory,
}: Props) {
  // Chips de frase (word contém espaço) ficam sempre em layout flex (não grid)
  const hasPhrase = chips.some(c => c.word.includes(' '))
  const isGrid = chips.length === 4 && !hasPhrase

  return (
    <>
      <style>{`
        @keyframes hint-ring {
          0%, 100% { box-shadow: var(--chip-shadow), 0 0 0 2px var(--chip-ring), 0 0 14px var(--chip-ring); }
          50%       { box-shadow: var(--chip-shadow), 0 0 0 4px var(--chip-ring), 0 0 26px var(--chip-ring); }
        }
        @keyframes konami-sparkle {
          0%,100% { opacity: 0.45; transform: scale(0.85); }
          50%     { opacity: 0.90; transform: scale(1.10); }
        }
        @keyframes chip-drop {
          0%   { opacity: 0; transform: translateY(-10px) rotate(var(--tilt)) scale(0.85); }
          100% { opacity: 1; transform: translateY(0)    rotate(var(--tilt)) scale(1); }
        }
        @keyframes craving-pulse {
          0%,100% { box-shadow: var(--chip-shadow), 0 0 0 2px rgba(251,191,36,0.7), 0 0 18px rgba(251,191,36,0.5); }
          50%     { box-shadow: var(--chip-shadow), 0 0 0 4px rgba(251,191,36,0.9), 0 0 32px rgba(251,191,36,0.7); }
        }
        @keyframes chip-new {
          0%   { opacity: 0; transform: translateY(-28px) rotate(var(--tilt)) scale(0.65); filter: brightness(2.2); }
          50%  { opacity: 1; transform: translateY(5px)   rotate(var(--tilt)) scale(1.12); filter: brightness(1.4); }
          68%  { transform: translateY(-3px) rotate(var(--tilt)) scale(0.96); filter: brightness(1.1); }
          82%  { transform: translateY(1px)  rotate(var(--tilt)) scale(1.02); filter: brightness(1.05); }
          100% { opacity: 1; transform: translateY(0)    rotate(var(--tilt)) scale(1);    filter: brightness(1); }
        }
      `}</style>

      <div style={
        isGrid
          ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%' }
          : { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }
      }>
        {chips.map((entry, index) => {
          const isFlying   = entry.id === flyingId
          const isNew      = entry.id === newChipId
          const isHinted   = hintIds?.has(entry.id) ?? false
          const isKonami   = konamiHintId === entry.id
          const isReview   = reviewIds?.has(entry.id) ?? false
          const isMastered = masteredIds?.has(entry.id) ?? false
          const isPhrase   = entry.word.includes(' ')
          const isCraving  = !!cravingCategory && entry.category === cravingCategory && !isPhrase
          const color      = getCategoryColor(entry.category)
          const tilt       = isPhrase ? 0 : getTilt(entry.id, index)
          const radius     = isGrid ? FOOD_RADII[index % FOOD_RADII.length] : isPhrase ? '14px' : '999px'
          const catEmoji   = CATEGORY_EMOJI[entry.category] ?? '✨'

          // Sombra 3D: glow colorida + borda inferior sólida (simula profundidade)
          const depth = `0 5px 0 ${color.bg}88`
          const glow  = `0 4px 18px ${color.glow}`
          const baseShadow = `${depth}, ${glow}`

          const transform = `rotate(${tilt}deg)`

          return (
            <button
              key={entry.id}
              onClick={(e) => {
                if (disabled) return
                const rect = e.currentTarget.getBoundingClientRect()
                onSelect(entry, rect)
              }}
              disabled={disabled}
              style={{
                position: 'relative',
                padding: isPhrase
                  ? (isKids ? '11px 16px 14px' : '10px 14px 13px')
                  : (isKids ? '14px 20px 18px' : '12px 18px 16px'),
                fontSize: isPhrase
                  ? (entry.word.length > 28 ? 13 : isKids ? 17 : 16)
                  : (isKids ? 17 : 16),
                ...(isGrid ? { width: '100%', textAlign: 'center' as const } : {}),
                ...(isPhrase ? { width: '100%', textAlign: 'center' as const } : {}),
                fontWeight: 900,
                borderRadius: radius,
                border: 'none',
                background: isFlying ? `${color.bg}22` : chipGradient(color.bg),
                color: isFlying ? 'transparent' : 'white',
                cursor: disabled ? 'default' : 'pointer',
                boxShadow: isFlying ? 'none' : baseShadow,
                opacity: isFlying ? 0 : disabled && flyingId !== null ? 0.50 : 1,
                // Tilt constante via CSS var para usar na animação chip-drop
                ['--tilt' as string]: `${tilt}deg`,
                transform: isFlying ? 'none' : transform,
                transition: 'opacity 0.12s ease, transform 0.12s ease',
                animation: isCraving && !isFlying && !disabled
                  ? 'craving-pulse 1.4s ease-in-out infinite'
                  : isHinted && !isFlying && !disabled
                  ? 'hint-ring 1.1s ease-in-out infinite'
                  : isNew && !isFlying && !disabled
                    ? 'chip-new 0.52s cubic-bezier(0.34, 1.56, 0.64, 1) both'
                  : !isFlying && !disabled
                    ? 'chip-drop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both'
                    : 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                letterSpacing: 0.3,
                ['--chip-shadow' as string]: baseShadow,
                ['--chip-ring'   as string]: color.ring,
                textShadow: '0 1px 2px rgba(0,0,0,0.30)',
              } as React.CSSProperties}
              onPointerDown={e => {
                if (!disabled && !isFlying) {
                  playChipTap()
                  hapticTap()
                  e.currentTarget.style.transform = `rotate(${tilt}deg) scale(0.93) translateY(3px)`
                  e.currentTarget.style.boxShadow = `0 2px 0 ${color.bg}88, ${glow}`
                }
              }}
              onPointerUp={e => {
                if (!disabled && !isFlying) {
                  e.currentTarget.style.transform = `rotate(${tilt}deg) scale(1)`
                  e.currentTarget.style.boxShadow = baseShadow
                }
              }}
              onPointerLeave={e => {
                if (!disabled && !isFlying) {
                  e.currentTarget.style.transform = transform
                  e.currentTarget.style.boxShadow = baseShadow
                }
              }}
            >
              {/* Highlight de luz no topo — simula objeto 3D */}
              {!isFlying && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 0, left: '8%', right: '8%', height: '40%',
                    borderRadius: `${radius} ${radius} 0 0`,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Emoji de categoria — pequeno, antes da palavra */}
              {!isFlying && (
                <span
                  aria-hidden
                  style={{
                    fontSize: isKids ? 13 : 12,
                    marginRight: 6,
                    opacity: 0.85,
                    verticalAlign: 'middle',
                  }}
                >
                  {isCraving ? '🔥' : catEmoji}
                </span>
              )}

              <span style={{ verticalAlign: 'middle' }}>{entry.word}</span>

              {/* Konami hint */}
              {isKonami && !isFlying && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -5, right: -3,
                    fontSize: 11,
                    pointerEvents: 'none',
                    animation: 'konami-sparkle 1.4s ease-in-out infinite',
                  }}
                >
                  ✨
                </span>
              )}

              {/* Review / mastery */}
              {!isFlying && (isReview || isMastered) && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -5, left: 4,
                    fontSize: 10, lineHeight: 1,
                    pointerEvents: 'none',
                    opacity: isMastered ? 1 : 0.65,
                    filter: isMastered ? 'none' : 'grayscale(0.3)',
                  }}
                >
                  {isMastered ? '⭐' : '☆'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
