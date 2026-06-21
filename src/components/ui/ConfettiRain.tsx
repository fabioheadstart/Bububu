import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// ── Cores vibrantes do confetti — mistura de categorias ──────────────────────
const COLORS = [
  '#f59e0b', '#fbbf24', '#fde68a',  // dourado jackpot
  '#7c3aed', '#a855f7', '#c084fc',  // roxo bububu
  '#10b981', '#34d399', '#6ee7b7',  // verde
  '#ef4444', '#f87171', '#fca5a5',  // vermelho
  '#3b82f6', '#60a5fa', '#93c5fd',  // azul
  '#ec4899', '#f472b6', '#fbcfe8',  // rosa
]

const SHAPES = ['●', '■', '▲', '★', '◆', '✦']

interface Piece {
  id: number
  x: number          // 0-100 (vw %)
  color: string
  shape: string
  size: number       // px
  speed: number      // animation duration (s)
  delay: number      // s
  rotation: number   // deg inicial
  rotSpeed: number   // deg por segundo (via duration modulado)
  swayX: number      // px lateral swing
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: 8 + Math.floor(Math.random() * 10),   // 8–18px
    speed: 1.4 + Math.random() * 1.2,            // 1.4–2.6s
    delay: Math.random() * 0.6,                  // 0–0.6s stagger
    rotation: Math.floor(Math.random() * 360),
    rotSpeed: 200 + Math.floor(Math.random() * 400), // fast spin
    swayX: 20 + Math.floor(Math.random() * 40),  // lateral sway px
  }))
}

interface Props {
  active: boolean    // true → dispara chuva; false → noop
  count?: number
}

export function ConfettiRain({ active, count = 52 }: Props) {
  const piecesRef  = useRef<Piece[]>(makePieces(count))
  // Gera novas peças toda vez que ativar (evita repetição visual)
  const keyRef     = useRef(0)

  useEffect(() => {
    if (active) {
      piecesRef.current = makePieces(count)
      keyRef.current++
    }
  }, [active, count])

  if (!active) return null

  const pieces = piecesRef.current
  const k      = keyRef.current

  return createPortal(
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   {
            transform: translateY(-20px) translateX(0) rotate(var(--rot-start));
            opacity: 1;
          }
          80%  {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--sway)) rotate(var(--rot-end));
            opacity: 0;
          }
        }
      `}</style>

      <div
        key={k}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1500,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {pieces.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: 0,
              fontSize: p.size,
              color: p.color,
              lineHeight: 1,
              animation: `confetti-fall ${p.speed}s ${p.delay}s ease-in forwards`,
              ['--rot-start' as string]: `${p.rotation}deg`,
              ['--rot-end'   as string]: `${p.rotation + p.rotSpeed}deg`,
              ['--sway'      as string]: `${(Math.random() > 0.5 ? 1 : -1) * p.swayX}px`,
            } as React.CSSProperties}
          >
            {p.shape}
          </div>
        ))}
      </div>
    </>,
    document.body
  )
}
