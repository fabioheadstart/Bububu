import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { EvolutionStage } from '@/components/bububu/BububuCharacter'
import { playLevelUp } from '@/lib/audio/sounds'

interface Props {
  stage: EvolutionStage
  phrase: string
  onDone: () => void
}

const STAGE_INFO: Record<EvolutionStage, {
  emoji: string; name: string; color: string; glow: string; bg: string
}> = {
  baby:    { emoji: '🐣', name: 'Bebê',      color: '#ddd6fe', glow: 'rgba(196,181,253,0.7)', bg: 'rgba(12,4,40,0.97)' },
  growing: { emoji: '🌱', name: 'Crescendo', color: '#86efac', glow: 'rgba(134,239,172,0.7)', bg: 'rgba(4,20,12,0.97)' },
  teen:    { emoji: '⭐', name: 'Jovem',     color: '#fbbf24', glow: 'rgba(251,191,36,0.80)', bg: 'rgba(20,12,0,0.97)'  },
  adult:   { emoji: '👑', name: 'Adulto',    color: '#f97316', glow: 'rgba(249,115,22,0.80)', bg: 'rgba(24,8,0,0.97)'  },
}

// 16 partículas em ângulos distribuídos
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  angle: i * 22.5,
  dist:  80 + Math.random() * 60,
  size:  6 + Math.random() * 8,
  delay: Math.random() * 0.2,
  dur:   0.55 + Math.random() * 0.25,
}))

// 3 anéis expansores
const RINGS = [
  { delay: 0,    dur: 1.1 },
  { delay: 0.28, dur: 1.1 },
  { delay: 0.56, dur: 1.1 },
]

const STYLES = `
  @keyframes evo-bg {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes evo-char {
    0%   { transform: scale(0.1) rotate(-25deg); opacity: 0; filter: blur(10px); }
    60%  { transform: scale(1.30) rotate(6deg);  opacity: 1; filter: blur(0); }
    78%  { transform: scale(0.92) rotate(-2deg); }
    90%  { transform: scale(1.06) rotate(1deg);  }
    100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
  }
  @keyframes evo-name {
    0%   { transform: translateY(30px) scale(0.80); opacity: 0; }
    60%  { transform: translateY(-4px) scale(1.05); opacity: 1; }
    100% { transform: translateY(0)    scale(1);    opacity: 1; }
  }
  @keyframes evo-phrase {
    0%   { transform: translateY(14px); opacity: 0; }
    100% { transform: translateY(0);    opacity: 1; }
  }
  @keyframes evo-continue {
    0%   { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes evo-particle {
    0%   { transform: rotate(var(--a)) translateX(0)   scale(1);   opacity: 1; }
    100% { transform: rotate(var(--a)) translateX(var(--d)) scale(0); opacity: 0; }
  }
  @keyframes evo-ring {
    0%   { transform: scale(0.2); opacity: 0.9; }
    100% { transform: scale(3.5); opacity: 0;   }
  }
  @keyframes evo-glow-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1);    }
    50%       { opacity: 1;   transform: scale(1.12); }
  }
  @keyframes evo-label {
    0%   { opacity: 0; letter-spacing: 12px; }
    100% { opacity: 1; letter-spacing: 5px;  }
  }
`

export function EvolutionOverlay({ stage, phrase, onDone }: Props) {
  const info = STAGE_INFO[stage]

  useEffect(() => {
    playLevelUp()
    const t = setTimeout(onDone, 6000)
    return () => clearTimeout(t)
  }, [onDone])

  return createPortal(
    <>
      <style>{STYLES}</style>
      <div
        onClick={onDone}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: info.bg,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          animation: 'evo-bg 0.20s ease forwards',
        }}
      >
        {/* Glow radial de fundo */}
        <div style={{
          position: 'absolute',
          width: 340, height: 340,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${info.glow} 0%, transparent 70%)`,
          animation: 'evo-glow-pulse 1.6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Anéis expansores */}
        {RINGS.map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 120, height: 120,
            borderRadius: '50%',
            border: `2px solid ${info.color}`,
            animation: `evo-ring ${r.dur}s ${r.delay}s ease-out infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Partículas burst */}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: info.color,
            ['--a' as string]: `${p.angle}deg`,
            ['--d' as string]: `${p.dist}px`,
            animation: `evo-particle ${p.dur}s ${p.delay}s ease-out infinite`,
            pointerEvents: 'none',
            boxShadow: `0 0 6px ${info.glow}`,
          } as React.CSSProperties} />
        ))}

        {/* "BUBUBU EVOLUIU!" */}
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 5,
          textTransform: 'uppercase',
          color: `${info.color}99`,
          animation: 'evo-label 0.5s ease 0.15s both',
          marginBottom: 10,
          zIndex: 1,
        }}>
          Bububu evoluiu!
        </div>

        {/* Emoji principal */}
        <div style={{
          fontSize: 'clamp(88px, 24vw, 116px)',
          lineHeight: 1,
          animation: 'evo-char 0.72s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
          filter: `drop-shadow(0 0 36px ${info.glow}) drop-shadow(0 0 70px ${info.glow})`,
          zIndex: 1,
          marginBottom: 6,
        }}>
          {info.emoji}
        </div>

        {/* Nome do estágio */}
        <div style={{
          fontSize: 'clamp(52px, 15vw, 74px)',
          fontWeight: 900,
          color: info.color,
          letterSpacing: '-2px',
          lineHeight: 1,
          textShadow: `0 0 40px ${info.glow}, 0 0 90px ${info.glow}`,
          animation: 'evo-name 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.5s both',
          zIndex: 1,
          marginBottom: 20,
        }}>
          {info.name}
        </div>

        {/* Frase do Bububu */}
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.80)',
          textAlign: 'center',
          maxWidth: 260,
          lineHeight: 1.4,
          animation: 'evo-phrase 0.45s ease 1.0s both',
          zIndex: 1,
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          border: `1px solid ${info.color}33`,
          marginBottom: 28,
        }}>
          "{phrase}"
        </div>

        {/* Toque pra continuar */}
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.30)',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          animation: 'evo-continue 0.4s ease 2.5s both',
          zIndex: 1,
        }}>
          toque pra continuar
        </div>
      </div>
    </>,
    document.body
  )
}
