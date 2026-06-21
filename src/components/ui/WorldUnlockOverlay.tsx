import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { KidsWorldId } from '@/hooks/useKidsWorld'
import { WORLD_META } from '@/hooks/useKidsWorld'

interface Props {
  worldId: KidsWorldId | null
  onDone: () => void
}

export function WorldUnlockOverlay({ worldId, onDone }: Props) {
  useEffect(() => {
    if (!worldId) return
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [worldId, onDone])

  if (!worldId) return null

  const meta = WORLD_META[worldId]

  return createPortal(
    <>
      <style>{`
        @keyframes wu-bg {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes wu-emoji {
          0%   { transform: scale(0.1) rotate(-20deg); opacity: 0; }
          25%  { transform: scale(1.35) rotate(6deg);  opacity: 1; }
          45%  { transform: scale(0.92) rotate(-2deg); }
          60%  { transform: scale(1.08) rotate(1deg);  }
          75%  { transform: scale(1) rotate(0deg);      }
          100% { transform: scale(1) rotate(0deg);      opacity: 1; }
        }
        @keyframes wu-text {
          0%   { opacity: 0; transform: translateY(18px) scale(0.85); }
          30%  { opacity: 1; transform: translateY(0)    scale(1);    }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes wu-badge {
          0%   { opacity: 0; transform: scale(0.5); }
          35%  { opacity: 1; transform: scale(1.1); }
          50%  { transform: scale(0.95); }
          65%  { transform: scale(1); }
          85%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes wu-sparkle {
          0%, 100% { transform: scale(0) rotate(0deg);   opacity: 0; }
          20%      { transform: scale(1.3) rotate(15deg); opacity: 1; }
          60%      { transform: scale(1) rotate(-5deg);   opacity: 1; }
          85%      { opacity: 0.5; }
        }
      `}</style>
      <div
        onClick={onDone}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.72)',
          animation: 'wu-bg 3.2s ease-in-out forwards',
          cursor: 'pointer',
        }}
      >
        {/* Emoji do mundo */}
        <div style={{
          fontSize: 80,
          animation: 'wu-emoji 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards',
          filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.5))',
          marginBottom: 16,
        }}>
          {meta.emoji}
        </div>

        {/* Sparkles ao redor */}
        {[
          { top: -60, left: -70, delay: 0.2 },
          { top: -55, left:  60, delay: 0.4 },
          { top:  40, left: -80, delay: 0.3 },
          { top:  50, left:  70, delay: 0.5 },
          { top: -20, left:  95, delay: 0.1 },
          { top: -30, left: -95, delay: 0.6 },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `calc(50% + ${s.top}px)`,
            left: `calc(50% + ${s.left}px)`,
            fontSize: 22,
            animation: `wu-sparkle 1.4s ${s.delay}s ease-out forwards`,
            zIndex: 1,
          }}>✨</div>
        ))}

        {/* "MUNDO NOVO!" */}
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: 2,
          textShadow: '0 0 24px rgba(255,200,80,0.9), 0 2px 0 rgba(0,0,0,0.5)',
          animation: 'wu-text 3.2s ease-in-out forwards',
          marginBottom: 10,
        }}>
          MUNDO NOVO! 🎉
        </div>

        {/* Nome do mundo */}
        <div style={{
          fontSize: 20,
          fontWeight: 800,
          color: 'rgba(255,255,220,0.95)',
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          animation: 'wu-badge 3.2s ease-in-out forwards',
          background: 'rgba(255,255,255,0.12)',
          padding: '8px 20px',
          borderRadius: 99,
          border: '1.5px solid rgba(255,255,255,0.25)',
        }}>
          {meta.name}
        </div>

        {/* Toque para fechar */}
        <div style={{
          position: 'absolute', bottom: 40,
          fontSize: 12, fontWeight: 700,
          color: 'rgba(255,255,255,0.40)',
          letterSpacing: 1,
        }}>
          toque para continuar
        </div>
      </div>
    </>,
    document.body
  )
}
