// Balão de fala do Bububu — aparece, fica 2.8s, some

interface Props {
  text: string | null
  isKids?: boolean
}

export function BububuSpeech({ text, isKids = false }: Props) {
  if (!text) return null

  const bg     = isKids ? 'rgba(255,255,255,0.97)' : 'rgba(22,6,60,0.97)'
  const color  = isKids ? '#2d1f6b' : '#e9d5ff'
  const border = isKids ? '2px solid rgba(255,217,61,0.55)' : '1px solid rgba(192,132,252,0.40)'

  return (
    <>
      <style>{`
        @keyframes speech-life {
          0%   { opacity: 0; transform: translateY(8px) scale(0.88); }
          14%  { opacity: 1; transform: translateY(0)  scale(1.03); }
          22%  { transform: scale(1); }
          78%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>

      {/* key=text faz reanimar a cada frase nova */}
      <div
        key={text}
        style={{
          position: 'absolute',
          top: '14%',
          left: 'calc(50% + 14px)',
          zIndex: 10,
          pointerEvents: 'none',
          animation: 'speech-life 2.9s ease-out forwards',
        }}
      >
        <div style={{
          position: 'relative',
          background: bg,
          color,
          border,
          borderRadius: 14,
          padding: '9px 14px',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.35,
          maxWidth: 180,
          boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          {text}

          {/* Triângulo apontando para baixo-esquerda (para a boca do Bububu) */}
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: 14,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${isKids ? 'rgba(255,255,255,0.97)' : 'rgba(22,6,60,0.97)'}`,
          }} />
        </div>
      </div>
    </>
  )
}
