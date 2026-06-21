// Explode partículas coloridas a partir de um ponto na tela (via portal)
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface BurstData {
  id: number
  x: number      // screen center X
  y: number      // screen center Y
  color: string  // cor principal (bg do chip)
  ring: string   // cor secundária (ring/glow)
}

// 14 ângulos distribuídos + variação aleatória para parecer orgânico
const BASE_ANGLES = Array.from({ length: 14 }, (_, i) => (360 / 14) * i)

// Configuração de cada partícula
const PARTICLES = BASE_ANGLES.map((angle, i) => {
  const jitter  = (i % 2 === 0 ? 1 : -1) * (i % 4) * 4  // ±0–12°
  const a       = angle + jitter
  const dist    = 48 + (i % 5) * 16                       // 48–112px
  const size    = i % 3 === 0 ? 9 : i % 3 === 1 ? 6 : 4  // 3 tamanhos
  const dur     = 0.42 + (i % 4) * 0.07                   // 0.42–0.63s
  const rad     = (a * Math.PI) / 180
  return { dx: Math.cos(rad) * dist, dy: Math.sin(rad) * dist, size, dur, colorIdx: i % 3 }
})

interface Props {
  burst: BurstData
  onDone: (id: number) => void
}

export function ParticleBurst({ burst, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onDone(burst.id), 700)
    return () => clearTimeout(t)
  }, [burst.id, onDone])

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {PARTICLES.map((p, i) => {
        // Alterna entre cor principal, cor ring e branco
        const fill = p.colorIdx === 0 ? burst.color
                   : p.colorIdx === 1 ? burst.ring
                   : '#ffffff'
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: burst.x - p.size / 2,
              top:  burst.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: fill,
              boxShadow: `0 0 ${p.size * 1.5}px ${fill}`,
              animation: `particle-fly ${p.dur}s ease-out forwards`,
              ['--pdx' as string]: `${p.dx}px`,
              ['--pdy' as string]: `${p.dy}px`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>,
    document.body
  )
}
