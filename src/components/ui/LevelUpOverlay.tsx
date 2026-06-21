import { useEffect } from 'react'
import { playLevelUp } from '@/lib/audio/sounds'
import { getCategoryBadges } from '@/data/vocabulary/unlockSchedule'
import { BububuCharacter, getStage } from '@/components/bububu/BububuCharacter'

const EVOLUTION_LEVELS = new Set([5, 10, 15])

const STAGE_NAMES: Record<string, string> = {
  growing: 'Crescendo! 🌱',
  teen:    'Adolescente! ⭐',
  adult:   'Jovem adulto! 👑',
}

interface Props {
  level: number
  newCategories?: string[]
  onDone: () => void
}

export function LevelUpOverlay({ level, newCategories = [], onDone }: Props) {
  const isEvolution = EVOLUTION_LEVELS.has(level)
  const stage       = getStage(level)
  const stageName   = STAGE_NAMES[stage] ?? ''
  const baseDuration = isEvolution ? 4200 : newCategories.length > 0 ? 3200 : 2300

  useEffect(() => {
    playLevelUp()
    const t = setTimeout(onDone, baseDuration)
    return () => clearTimeout(t)
  }, [onDone, baseDuration])

  const badges = getCategoryBadges(newCategories)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: 'rgba(91,33,182,0.90)',
      backdropFilter: 'blur(6px)',
      animation: 'levelup-in 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      {/* Momento de evolução: mostra o Bububu no novo visual */}
      {isEvolution ? (
        <>
          <div style={{
            animation: 'levelup-star 0.65s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            opacity: 0,
            filter: 'drop-shadow(0 0 32px rgba(251,191,36,0.7))',
          }}>
            <BububuCharacter state="celebrating" level={level} />
          </div>

          <div style={{
            fontWeight: 900,
            fontSize: 36,
            color: '#fbbf24',
            letterSpacing: -0.5,
            textAlign: 'center',
            textShadow: '0 0 30px rgba(251,191,36,0.55)',
            animation: 'fadeSlideUp 0.4s 0.35s ease both',
            opacity: 0,
          }}>
            EVOLUIU! ✨
          </div>

          <div style={{
            fontWeight: 700,
            fontSize: 18,
            color: '#ddd6fe',
            animation: 'fadeSlideUp 0.4s 0.55s ease both',
            opacity: 0,
          }}>
            {stageName}
          </div>

          <div style={{
            fontWeight: 500,
            fontSize: 13,
            color: 'rgba(221,214,254,0.55)',
            animation: 'fadeSlideUp 0.4s 0.70s ease both',
            opacity: 0,
          }}>
            LEVEL {level}
          </div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: 80,
            lineHeight: 1,
            animation: 'levelup-star 0.55s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}>
            ⭐
          </div>

          <div style={{
            fontWeight: 900,
            fontSize: 42,
            color: '#ffffff',
            letterSpacing: -1,
            animation: 'fadeSlideUp 0.4s 0.25s ease both',
          }}>
            LEVEL {level}!
          </div>

          <div style={{
            fontWeight: 600,
            fontSize: 16,
            color: '#ddd6fe',
            animation: 'fadeSlideUp 0.4s 0.45s ease both',
          }}>
            Bububu está mais forte 💪
          </div>
        </>
      )}

      {/* Novas categorias desbloqueadas */}
      {badges.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
          animation: 'fadeSlideUp 0.4s 0.65s ease both',
          opacity: 0,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            color: 'rgba(221,214,254,0.60)',
            textTransform: 'uppercase',
          }}>
            🔓 palavras novas desbloqueadas
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {badges.map(({ cat, color }) => (
              <div
                key={cat}
                style={{
                  background: `${color.bg}cc`,
                  border: `1px solid ${color.ring}88`,
                  borderRadius: 99,
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: `0 0 12px ${color.glow}`,
                  animation: 'levelup-star 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
              >
                {color.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partículas decorativas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {['✨','⭐','💫','✨','💜','⭐'].map((e, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: 18 + (i % 3) * 6,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 2) * 40}%`,
            animation: `levelup-particle 1.8s ${0.1 + i * 0.12}s ease-out both`,
            opacity: 0,
          }}>
            {e}
          </span>
        ))}
      </div>
    </div>
  )
}
