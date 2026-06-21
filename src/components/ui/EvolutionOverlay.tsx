import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { EvolutionStage } from '@/components/bububu/BububuCharacter'

interface Props {
  stage: EvolutionStage
  onDone: () => void
}

const STAGE_INFO: Record<EvolutionStage, {
  emoji: string; name: string; color: string; glow: string; sub: string
}> = {
  baby:    { emoji: '🐣', name: 'Bebê',      color: '#ddd6fe', glow: 'rgba(196,181,253,0.6)', sub: 'o começo de tudo' },
  growing: { emoji: '🌱', name: 'Crescendo', color: '#c4b5fd', glow: 'rgba(167,139,250,0.6)', sub: 'ele está ficando maior' },
  teen:    { emoji: '⭐', name: 'Jovem',     color: '#fbbf24', glow: 'rgba(251,191,36,0.7)',  sub: 'uma estrela nasceu' },
  adult:   { emoji: '👑', name: 'Adulto',    color: '#f59e0b', glow: 'rgba(245,158,11,0.7)',  sub: 'rei do vocabulário' },
}

const STYLES = `
  @keyframes evo-bg {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes evo-emoji {
    0%   { transform: scale(0.2) rotate(-20deg); opacity: 0; filter: blur(8px); }
    65%  { transform: scale(1.25) rotate(4deg);  opacity: 1; filter: blur(0); }
    100% { transform: scale(1)    rotate(0deg);  opacity: 1; filter: blur(0); }
  }
  @keyframes evo-title {
    0%   { transform: translateY(24px) scale(0.85); opacity: 0; }
    100% { transform: translateY(0)    scale(1);    opacity: 1; }
  }
  @keyframes evo-badge {
    0%   { transform: scale(0.7); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes evo-star {
    0%, 100% { transform: scale(1)    rotate(0deg);   opacity: 0.9; }
    50%       { transform: scale(1.25) rotate(15deg);  opacity: 1;   }
  }
  @keyframes evo-pulse {
    0%, 100% { box-shadow: 0 0 40px var(--evo-glow), 0 0 80px var(--evo-glow); }
    50%       { box-shadow: 0 0 70px var(--evo-glow), 0 0 130px var(--evo-glow); }
  }
`

const STARS = [
  { top: '8%',  left: '12%', size: 22, dur: 1.8, delay: 0.1 },
  { top: '12%', left: '78%', size: 18, dur: 2.2, delay: 0.3 },
  { top: '22%', left: '90%', size: 14, dur: 1.6, delay: 0.5 },
  { top: '70%', left: '8%',  size: 20, dur: 2.0, delay: 0.2 },
  { top: '75%', left: '88%', size: 16, dur: 1.9, delay: 0.4 },
  { top: '85%', left: '22%', size: 12, dur: 2.3, delay: 0.6 },
  { top: '18%', left: '5%',  size: 10, dur: 1.7, delay: 0.8 },
  { top: '88%', left: '70%', size: 14, dur: 2.1, delay: 0.0 },
]

export function EvolutionOverlay({ stage, onDone }: Props) {
  const info = STAGE_INFO[stage]

  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return createPortal(
    <>
      <style>{STYLES}</style>
      <div
        onClick={onDone}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(8, 0, 24, 0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 0,
          cursor: 'pointer',
          pointerEvents: 'all',
          animation: 'evo-bg 0.28s ease forwards',
          ['--evo-glow' as string]: info.glow,
        } as React.CSSProperties}
      >
        {/* Estrelinhas decorativas */}
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', top: s.top, left: s.left,
            fontSize: s.size,
            animation: `evo-star ${s.dur}s ${s.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
          }}>✨</div>
        ))}

        {/* Emoji do estágio */}
        <div style={{
          fontSize: 'clamp(80px, 22vw, 108px)',
          lineHeight: 1,
          animation: 'evo-emoji 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards',
          filter: `drop-shadow(0 0 32px ${info.glow})`,
          marginBottom: 8,
        }}>
          {info.emoji}
        </div>

        {/* "BUBUBU EVOLUIU!" */}
        <div style={{
          fontSize: 'clamp(13px, 4vw, 16px)',
          fontWeight: 700,
          letterSpacing: 5,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          animation: 'evo-title 0.45s ease 0.3s both',
          marginBottom: 6,
        }}>
          Bububu evoluiu!
        </div>

        {/* Nome do estágio */}
        <div style={{
          fontSize: 'clamp(54px, 16vw, 76px)',
          fontWeight: 900,
          color: info.color,
          letterSpacing: '-2px',
          lineHeight: 1,
          textShadow: `0 0 40px ${info.glow}, 0 0 90px ${info.glow}, 0 4px 0 rgba(0,0,0,0.6)`,
          animation: 'evo-title 0.50s ease 0.45s both',
          marginBottom: 14,
        }}>
          {info.name}
        </div>

        {/* Badge subtítulo */}
        <div style={{
          padding: '6px 20px',
          borderRadius: 99,
          background: `rgba(255,255,255,0.07)`,
          border: `1px solid ${info.color}44`,
          fontSize: 14,
          color: `${info.color}cc`,
          fontStyle: 'italic',
          animation: 'evo-badge 0.40s ease 0.70s both',
        }}>
          {info.sub}
        </div>

        {/* Anel de pulso */}
        <div style={{
          position: 'absolute',
          width: 200, height: 200,
          borderRadius: '50%',
          border: `2px solid ${info.color}33`,
          animation: 'evo-pulse 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      </div>
    </>,
    document.body
  )
}
