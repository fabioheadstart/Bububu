import { useEffect, useRef } from 'react'

interface Props {
  word: string
  startX: number   // centro do chip tocado (fixed coords)
  startY: number
  endX: number     // boca do Bububu (fixed coords)
  endY: number
  onDone: () => void
}

export function FlyingChip({ word, startX, startY, endX, endY, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const dx = endX - startX
    const dy = endY - startY

    // Frame 0 — posição inicial, sem transição
    el.style.transition = 'none'
    el.style.transform  = 'translate(-50%, -50%) scale(1)'
    el.style.opacity    = '1'

    // Dois rAF garante que o browser pintou o frame inicial antes de animar
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = [
          'transform 0.50s cubic-bezier(0.4, 0, 0.6, 1)',
          'opacity   0.50s cubic-bezier(0.4, 0, 0.6, 1)',
        ].join(', ')
        // Voa até a boca e encolhe até sumir
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.12)`
        el.style.opacity   = '0'
      })
    })

    const t = setTimeout(onDone, 520)
    return () => clearTimeout(t)
  }, [startX, startY, endX, endY, onDone])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: startX,
        top: startY,
        zIndex: 999,
        pointerEvents: 'none',
        padding: '13px 22px',
        fontSize: 17,
        fontWeight: 700,
        borderRadius: 999,
        background: '#7c3aed',
        color: 'white',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(124,58,237,0.5)',
        // estado inicial — JS sobrescreve via ref
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1,
      }}
    >
      {word}
    </div>
  )
}
