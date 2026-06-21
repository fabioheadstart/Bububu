import { useEffect } from 'react'
import { playLevelUp } from '@/lib/audio/sounds'

interface Props {
  level: number
  onDone: () => void
}

export function LevelUpOverlay({ level, onDone }: Props) {
  useEffect(() => {
    playLevelUp()
    const t = setTimeout(onDone, 2300)
    return () => clearTimeout(t)
  }, [onDone])

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
