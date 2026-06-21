import { useEffect } from 'react'

interface Props {
  word: string
  isKids?: boolean
  onDone: () => void
}

// Toast íntimo de mastery — aparece por 1.8s, sem tomar a tela toda
export function MasteryToast({ word, isKids = false, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 800,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      pointerEvents: 'none',
      animation: 'mastery-toast 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    }}>
      <div style={{
        background: isKids
          ? 'rgba(255, 247, 220, 0.97)'
          : 'rgba(30, 10, 70, 0.95)',
        border: `1px solid ${isKids ? 'rgba(180,83,9,0.30)' : 'rgba(251,191,36,0.35)'}`,
        borderRadius: 20,
        padding: '10px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase' as const,
          color: isKids ? '#b45309' : '#fbbf24',
        }}>
          dominada ⭐
        </span>
        <span style={{
          fontSize: 20,
          fontWeight: 900,
          color: isKids ? '#2D1F6B' : '#ffffff',
          letterSpacing: -0.5,
        }}>
          {word}
        </span>
      </div>

      <style>{`
        @keyframes mastery-toast {
          0%   { opacity: 0; transform: translate(-50%, -46%) scale(0.85); }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
          25%  { transform: translate(-50%, -50%) scale(1); }
          75%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -53%) scale(0.95); }
        }
      `}</style>
    </div>
  )
}
