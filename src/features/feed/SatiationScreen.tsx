import { useState, useEffect } from 'react'
import type { AppMode } from '@/types'
import { DAILY_LIMIT } from '@/types'

interface Props {
  mode:          AppMode
  wordsToday:    number
  streak:        number
  onContinue:    () => void   // continuar com XP reduzido
  onPlayMemory?: () => void   // jogar memory com as palavras do dia
}

function getMidnightMs(): number {
  const d = new Date()
  d.setHours(24, 0, 0, 0)   // próxima meia-noite
  return d.getTime()
}

function getReturnTime(): string {
  // Mostra "amanhã" se meia-noite já passou ou está próxima
  return 'amanhã'
}

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()))
  useEffect(() => {
    const id = setInterval(() => {
      const r = Math.max(0, targetMs - Date.now())
      setRemaining(r)
      if (r === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [targetMs])
  const hrs  = Math.floor(remaining / 3600000)
  const mins = Math.floor((remaining % 3600000) / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  if (hrs > 0) return `${hrs}h ${mins.toString().padStart(2,'0')}min`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function SatiationScreen({ mode, wordsToday, streak, onContinue, onPlayMemory }: Props) {
  const limit      = DAILY_LIMIT[mode]
  const returnTime = getReturnTime()
  const targetMs   = getMidnightMs()
  const countdown  = useCountdown(targetMs)
  const isKids     = mode === 'kids'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1,
      background: isKids
        ? 'linear-gradient(170deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)'
        : 'linear-gradient(170deg, #1c0a3d 0%, #2d1060 50%, #1a1040 100%)',
      padding: '12px 20px',
      position: 'relative', overflowY: 'auto',
    }}>

      {/* Partículas de fundo */}
      {['✨','⭐','💫','🌟','✨','💜','⭐'].map((e, i) => (
        <span key={i} style={{
          position: 'absolute',
          top:  `${8 + i * 12}%`,
          left: `${5 + i * 14}%`,
          fontSize: 16 + (i % 3) * 6,
          opacity: 0.25 + (i % 3) * 0.1,
          animation: `bub-float ${3 + i * 0.5}s ${i * 0.3}s ease-in-out infinite`,
          pointerEvents: 'none',
        }}>{e}</span>
      ))}

      {/* Bububu satisfeito — SVG inline */}
      <div style={{
        position: 'relative',
        animation: 'bub-celebrate 2s ease-in-out infinite',
        marginBottom: 0,
        filter: isKids
          ? 'drop-shadow(0 12px 28px rgba(251,191,36,0.50))'
          : 'drop-shadow(0 12px 28px rgba(167,139,250,0.50))',
      }}>
        <svg width="110" height="128" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="135" rx="42" ry="7" fill="rgba(0,0,0,0.10)" />

          {/* Corpo mais redondo / satisfeito */}
          <path
            d="M 60 8 C 98 8, 112 32, 111 64 C 110 96, 94 122, 60 126 C 26 122, 10 96, 9 64 C 8 32, 22 8, 60 8 Z"
            fill={isKids ? '#fbbf24' : '#a78bfa'}
          />
          <ellipse cx="38" cy="30" rx="15" ry="9" fill="rgba(255,255,255,0.35)" transform="rotate(-20 38 30)" />

          {/* Bochechas coradas de satisfeito */}
          <circle cx="24" cy="74" r="11" fill="rgba(255,100,100,0.30)" />
          <circle cx="96" cy="74" r="11" fill="rgba(255,100,100,0.30)" />

          {/* Olhos em meia-lua — satisfeito/contente */}
          <path d="M 34 48 Q 44 40 54 48" stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 66 48 Q 76 40 86 48" stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Sorriso largo */}
          <path d="M 38 78 Q 60 98 82 78" stroke="#1a1a2e" strokeWidth="3.5" fill={isKids ? 'rgba(254,215,0,0.4)' : 'rgba(167,139,250,0.3)'} strokeLinecap="round" />

          {/* Barriguinha cheia — bolinha sutil */}
          <ellipse cx="60" cy="108" rx="18" ry="10" fill="rgba(255,255,255,0.12)" />
        </svg>

        {/* Estrelinhas ao redor */}
        {['⭐','✨','🌟'].map((s, i) => (
          <span key={i} style={{
            position: 'absolute',
            top:  i === 0 ? '-8%' : i === 1 ? '10%' : '-5%',
            left: i === 0 ? '80%' : i === 1 ? '-15%' : '75%',
            fontSize: 20 - i * 3,
            animation: `bub-spark ${0.8 + i * 0.2}s ${i * 0.25}s ease-out infinite`,
          }}>{s}</span>
        ))}
      </div>

      {/* Título */}
      <div style={{
        textAlign: 'center', marginTop: 8, marginBottom: 10,
      }}>
        <div style={{
          fontSize: 22, fontWeight: 900,
          color: isKids ? '#92400e' : '#e9d5ff',
          marginBottom: 4, lineHeight: 1.2,
        }}>
          Bububu está saciado! 🎉
        </div>
        <div style={{
          fontSize: 13,
          color: isKids ? 'rgba(120,60,0,0.70)' : 'rgba(196,181,253,0.70)',
          lineHeight: 1.4,
        }}>
          Você alimentou {wordsToday} de {limit} palavras hoje.
          <br />Ótimo trabalho!
        </div>
      </div>

      {/* Card de resumo */}
      <div style={{
        width: '100%', maxWidth: 320,
        background: isKids ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${isKids ? 'rgba(251,191,36,0.40)' : 'rgba(167,139,250,0.25)'}`,
        borderRadius: 18, padding: '12px 16px',
        display: 'flex', gap: 0, flexDirection: 'column',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          borderBottom: `1px solid ${isKids ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
          paddingBottom: 10, marginBottom: 10,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: isKids ? '#b45309' : '#c4b5fd' }}>
              {wordsToday}
            </div>
            <div style={{ fontSize: 11, color: isKids ? 'rgba(0,0,0,0.45)' : 'rgba(196,181,253,0.50)', marginTop: 2 }}>
              palavras hoje
            </div>
          </div>
          <div style={{ width: 1, background: isKids ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: isKids ? '#b45309' : '#c4b5fd' }}>
              {streak > 0 ? `🔥 ${streak}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: isKids ? 'rgba(0,0,0,0.45)' : 'rgba(196,181,253,0.50)', marginTop: 2 }}>
              {streak === 1 ? 'dia seguido' : 'dias seguidos'}
            </div>
          </div>
        </div>

        {/* Timer de retorno */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: isKids ? 'rgba(0,0,0,0.45)' : 'rgba(196,181,253,0.50)', marginBottom: 4 }}>
            Bububu digere melhor com descanso
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: isKids ? '#92400e' : '#e9d5ff' }}>
            Volte {returnTime} ⏰
          </div>
          <div style={{ fontSize: 12, color: isKids ? 'rgba(0,0,0,0.35)' : 'rgba(196,181,253,0.35)', marginTop: 3 }}>
            {countdown} até meia-noite
          </div>
        </div>
      </div>

      {/* Botão memory */}
      {onPlayMemory && (
        <button
          onClick={onPlayMemory}
          style={{
            padding: '11px 28px', borderRadius: 16, border: 'none',
            background: isKids
              ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: isKids ? '#2D1F6B' : '#fff',
            fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: isKids
              ? '0 5px 0 #b45309, 0 8px 24px rgba(245,158,11,0.30)'
              : '0 5px 0 #4c1d95, 0 8px 24px rgba(124,58,237,0.3)',
            WebkitTapHighlightColor: 'transparent',
            marginBottom: 4,
          }}
        >
          🃏 Revisar palavras
        </button>
      )}

      {/* Botão continuar mesmo assim */}
      <button
        onClick={onContinue}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 13,
          color: isKids ? 'rgba(120,60,0,0.45)' : 'rgba(196,181,253,0.35)',
          cursor: 'pointer',
          textDecoration: 'underline',
          padding: '8px 16px',
        }}
      >
        Continuar mesmo assim (XP reduzido)
      </button>
    </div>
  )
}
