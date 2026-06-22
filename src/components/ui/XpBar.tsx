interface Props {
  level: number
  progress: number // 0–1
  wordsUntilNextStage?: number
  isKids?: boolean
}

export function XpBar({ level, progress, wordsUntilNextStage, isKids }: Props) {
  const isMax = level >= 15
  const fill  = Math.min(Math.max(progress, 0), 1) * 100

  return (
    <div style={{
      padding: '6px 20px 2px',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* Badge de nível */}
        <div style={{
          fontSize: 11,
          fontWeight: 900,
          color: '#7c3aed',
          background: '#ede9ff',
          borderRadius: 8,
          padding: '2px 8px',
          minWidth: 52,
          textAlign: 'center',
          letterSpacing: 0.2,
          flexShrink: 0,
        }}>
          {isMax ? 'MAX ⭐' : `LVL ${level}`}
        </div>

        {/* Barra */}
        <div style={{
          flex: 1,
          height: 7,
          background: '#e8e0ff',
          borderRadius: 99,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${fill}%`,
            background: isMax
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(90deg, #7c3aed, #a855f7)',
            borderRadius: 99,
            transition: 'width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: fill > 0
              ? '0 0 6px rgba(124,58,237,0.45)'
              : 'none',
          }} />
        </div>
      </div>

      {/* Falta X palavras pra evoluir */}
      {!isMax && wordsUntilNextStage != null && wordsUntilNextStage > 0 && (
        <div style={{
          textAlign: 'right',
          fontSize: 10,
          fontWeight: 600,
          color: isKids ? 'rgba(45,31,107,0.60)' : 'rgba(167,139,250,0.55)',
          marginTop: 3,
          letterSpacing: 0.2,
        }}>
          falta {wordsUntilNextStage} {wordsUntilNextStage === 1 ? 'palavra' : 'palavras'} pra evoluir
        </div>
      )}
    </div>
  )
}
