import { useEffect } from 'react'
import { playLevelUp } from '@/lib/audio/sounds'
import { getCategoryBadges } from '@/data/vocabulary/unlockSchedule'

interface Props {
  level: number
  newCategories?: string[]
  onDone: () => void
}

export function LevelUpOverlay({ level, newCategories = [], onDone }: Props) {
  useEffect(() => {
    playLevelUp()
    const t = setTimeout(onDone, newCategories.length > 0 ? 3200 : 2300)
    return () => clearTimeout(t)
  }, [onDone, newCategories.length])

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
