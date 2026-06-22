/**
 * QuizOptions — mini-quiz pós-feed
 *
 * Aparece na área dos chips enquanto o PoopReveal ainda está visível.
 * O usuário vê a tradução e é cobrado ao mesmo tempo — sem tela extra.
 * 4 opções de tradução, auto-avança em 1.3s após resposta.
 */
interface Props {
  word:          string       // palavra em inglês sendo testada
  options:       string[]     // 4 traduções (embaralhadas, inclui a correta)
  correctAnswer: string       // tradução correta
  selectedIdx:   number | null
  result:        'correct' | 'wrong' | null
  onAnswer:      (correct: boolean, idx: number) => void
  onContinue:    () => void   // chamado quando criança toca "continuar"
  isKids?:       boolean
}

export function QuizOptions({
  word, options, correctAnswer,
  selectedIdx, result, onAnswer, onContinue, isKids = false,
}: Props) {

  const labelColor  = isKids ? 'rgba(45,31,107,0.60)' : 'rgba(233,213,255,0.65)'

  return (
    <>
      <style>{`
        @keyframes quiz-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-5px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes quiz-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes quiz-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Pergunta */}
      <div style={{
        textAlign: 'center',
        fontSize: 11, fontWeight: 800, letterSpacing: 1,
        textTransform: 'uppercase',
        color: labelColor,
        marginBottom: 6,
        animation: 'quiz-fadein 0.30s ease both',
      }}>
        {isKids ? `🤔 O que é "${word}"?` : `Como se diz "${word}"?`}
      </div>

      {/* Opções */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        width: '100%',
        animation: 'quiz-fadein 0.35s ease 0.05s both',
      }}>
        {options.map((opt, i) => {
          const isSelected = selectedIdx === i
          const isCorrect  = opt === correctAnswer

          // Estado visual após resposta
          let bg     = isKids ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.08)'
          let border = `1px solid ${isKids ? 'rgba(45,31,107,0.18)' : 'rgba(255,255,255,0.14)'}`
          let color  = isKids ? '#2D1F6B' : 'rgba(255,255,255,0.88)'
          let anim   = 'none'
          let shadow = 'none'

          if (result !== null) {
            if (isCorrect) {
              bg     = 'rgba(16,185,129,0.22)'
              border = '1px solid rgba(16,185,129,0.60)'
              color  = '#34d399'
              shadow = '0 0 14px rgba(16,185,129,0.30)'
              if (isSelected) anim = 'quiz-pop 0.35s ease'
            } else if (isSelected) {
              bg     = 'rgba(239,68,68,0.20)'
              border = '1px solid rgba(239,68,68,0.50)'
              color  = '#f87171'
              anim   = 'quiz-shake 0.40s ease'
            }
          }

          return (
            <button
              key={i}
              disabled={result !== null}
              onClick={() => {
                if (result !== null) return
                onAnswer(isCorrect, i)
              }}
              style={{
                padding: '11px 10px',
                borderRadius: 14,
                border,
                background: bg,
                color,
                fontSize: opt.length > 18 ? 11 : 13,
                fontWeight: 800,
                cursor: result !== null ? 'default' : 'pointer',
                textAlign: 'center',
                lineHeight: 1.25,
                transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                animation: anim,
                boxShadow: shadow,
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Botão continuar — aparece após responder */}
      {result !== null && (
        <button
          onClick={onContinue}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '13px',
            borderRadius: 14,
            border: 'none',
            background: result === 'correct'
              ? 'rgba(16,185,129,0.22)'
              : (isKids ? 'rgba(45,31,107,0.14)' : 'rgba(255,255,255,0.10)'),
            color: result === 'correct'
              ? '#34d399'
              : (isKids ? 'rgba(45,31,107,0.70)' : 'rgba(255,255,255,0.65)'),
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: 0.3,
            WebkitTapHighlightColor: 'transparent',
            animation: 'quiz-fadein 0.30s ease both',
          }}
        >
          {result === 'correct' ? '✓ continuar' : 'entendi, continuar →'}
        </button>
      )}
    </>
  )
}
