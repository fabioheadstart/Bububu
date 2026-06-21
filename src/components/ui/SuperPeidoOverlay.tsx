import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  active: boolean
  onDone: () => void
}

const STYLES = `
  @keyframes sp-bg {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sp-text {
    0%   { transform: scale(0.05) rotate(-8deg); opacity: 0; filter: blur(14px); }
    65%  { transform: scale(1.10) rotate(1.5deg); opacity: 1; filter: blur(0); }
    100% { transform: scale(1)    rotate(0deg);   opacity: 1; filter: blur(0); }
  }
  @keyframes sp-emoji {
    0%   { transform: scale(0) rotate(-25deg) translateX(-30px); opacity: 0; }
    70%  { transform: scale(1.20) rotate(6deg) translateX(4px);  opacity: 1; }
    100% { transform: scale(1)    rotate(0deg) translateX(0);    opacity: 1; }
  }
  @keyframes sp-xp {
    from { opacity: 0; transform: translateY(18px) scale(0.8); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
  }
  @keyframes sp-shake {
    0%,100% { transform: translateX(0); }
    15%     { transform: translateX(-8px) rotate(-1deg); }
    30%     { transform: translateX(8px)  rotate(1deg);  }
    45%     { transform: translateX(-6px) rotate(-0.5deg); }
    60%     { transform: translateX(6px)  rotate(0.5deg);  }
    75%     { transform: translateX(-3px); }
  }
`

export function SuperPeidoOverlay({ active, onDone }: Props) {
  useEffect(() => {
    if (!active) return
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [active, onDone])

  if (!active) return null

  return createPortal(
    <>
      <style>{STYLES}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.86)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
        pointerEvents: 'none',
        animation: 'sp-bg 0.22s ease forwards',
      }}>
        {/* Texto principal */}
        <div style={{
          fontSize: 'clamp(64px, 18vw, 88px)',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-3px',
          lineHeight: 0.90,
          textAlign: 'center',
          textShadow: [
            '0 0 40px rgba(134,239,172,0.95)',
            '0 0 90px rgba(134,239,172,0.50)',
            '0 0 160px rgba(134,239,172,0.25)',
            '0 6px 0 rgba(0,0,0,0.75)',
          ].join(', '),
          animation: 'sp-text 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards, sp-shake 0.55s ease 0.55s',
        }}>
          SUPER<br />PEIDO
        </div>

        {/* Emoji */}
        <div style={{
          fontSize: 'clamp(72px, 20vw, 96px)',
          lineHeight: 1.15,
          animation: 'sp-emoji 0.60s cubic-bezier(0.34,1.56,0.64,1) 0.10s both',
          filter: 'drop-shadow(0 0 24px rgba(134,239,172,0.6))',
        }}>
          💨
        </div>

        {/* XP badge */}
        <div style={{
          marginTop: 10,
          fontSize: 20,
          fontWeight: 800,
          color: '#86efac',
          letterSpacing: 3,
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(134,239,172,0.7)',
          animation: 'sp-xp 0.40s ease 0.55s both',
        }}>
          🎰 +50 XP
        </div>
      </div>
    </>,
    document.body
  )
}
