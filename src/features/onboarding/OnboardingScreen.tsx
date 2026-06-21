import { useState } from 'react'
import { useProgress } from '@/hooks/useProgress'
import { playMenuHover } from '@/lib/audio/sounds'
import type { AppMode, DifficultyLevel } from '@/types'

interface Props {
  onComplete: () => void
}

interface ModeCard {
  mode: AppMode
  icon: string
  title: string
  age: string
  bullets: string[]
  accent: string
  border: string
  glow: string
}

interface DiffCard {
  difficulty: DifficultyLevel
  icon: string
  title: string
  sub: string
  accent: string
  border: string
  glow: string
}

const MODES: ModeCard[] = [
  {
    mode: 'kids',
    icon: '🌱',
    title: 'Kids',
    age: '6 a 12 anos',
    bullets: [
      'Bububu te espera quando você volta',
      'Progresso sempre protegido',
      'Compartilha só com a família',
      'Diversão sem pressão',
    ],
    accent: '#34d399',
    border: 'rgba(52,211,153,0.35)',
    glow: 'rgba(52,211,153,0.12)',
  },
  {
    mode: 'pro',
    icon: '⚡',
    title: 'Pro',
    age: '13 anos ou mais',
    bullets: [
      'Sequência real — faltou um dia, perdeu',
      'Ranking global',
      'Card de progresso compartilhável',
      'Sistema completo de recompensas',
    ],
    accent: '#c084fc',
    border: 'rgba(192,132,252,0.35)',
    glow: 'rgba(192,132,252,0.12)',
  },
]

const DIFFICULTIES: DiffCard[] = [
  {
    difficulty: 'easy',
    icon: '🌱',
    title: 'Fácil',
    sub: 'Estou começando agora',
    accent: '#34d399',
    border: 'rgba(52,211,153,0.35)',
    glow: 'rgba(52,211,153,0.12)',
  },
  {
    difficulty: 'medium',
    icon: '⚡',
    title: 'Médio',
    sub: 'Já sei o básico',
    accent: '#f59e0b',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.12)',
  },
  {
    difficulty: 'hard',
    icon: '🔥',
    title: 'Difícil',
    sub: 'Quero me desafiar',
    accent: '#f87171',
    border: 'rgba(248,113,113,0.35)',
    glow: 'rgba(248,113,113,0.12)',
  },
]

export function OnboardingScreen({ onComplete }: Props) {
  const { setMode, setDifficulty } = useProgress()
  const [step, setStep] = useState<1 | 2>(1)

  function handleModeChoose(mode: AppMode) {
    setMode(mode)
    setStep(2)
  }

  function handleDifficultyChoose(difficulty: DifficultyLevel) {
    setDifficulty(difficulty)
    onComplete()
  }

  return (
    <>
      <style>{`
        @keyframes bub-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .bub-mascot {
          animation: bub-float 3s ease-in-out infinite;
          display: inline-block;
          filter: drop-shadow(0 0 24px rgba(192,132,252,0.5));
        }
        .onb-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .onb-card:hover { transform: translateY(-3px); }
        .onb-card:active { transform: scale(0.98); }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .slide-in { animation: slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '40px 24px',
        gap: 28,
        background: 'linear-gradient(160deg, #0a041e 0%, #130826 60%, #0d0520 100%)',
      }}>

        {/* ── Mascote ── */}
        <div style={{ textAlign: 'center' }}>
          <div className="bub-mascot" style={{ fontSize: 84, lineHeight: 1 }}>🫧</div>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, margin: '14px 0 4px', color: '#f0e6ff' }}>
            Bububu
          </h1>
          <p style={{ color: 'rgba(196,132,252,0.7)', fontSize: 14, margin: 0 }}>
            Me dê palavras em inglês e eu vou crescer com você.
          </p>
        </div>

        {/* ── Step indicators ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              height: 6, borderRadius: 99,
              width: step === s ? 24 : 8,
              background: step >= s ? '#c084fc' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
        </div>

        {/* ── Step 1: Quem vai jogar? ── */}
        {step === 1 && (
          <div className="slide-in" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Quem vai jogar?
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {MODES.map(card => (
                <button
                  key={card.mode}
                  className="onb-card"
                  onMouseEnter={playMenuHover}
                  onClick={() => handleModeChoose(card.mode)}
                  style={{
                    flex: '1 1 200px',
                    background: card.glow,
                    border: `2px solid ${card.border}`,
                    borderRadius: 20,
                    padding: '28px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: `0 4px 24px ${card.glow}`,
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 10, lineHeight: 1 }}>{card.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: card.accent }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>{card.age}</div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {card.bullets.map(b => (
                      <li key={b} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{b}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Qual é o seu nível? ── */}
        {step === 2 && (
          <div className="slide-in" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Qual é o seu nível?
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '-6px 0 4px', textAlign: 'center' }}>
              Você pode mudar isso a qualquer hora durante o jogo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              {DIFFICULTIES.map(card => (
                <button
                  key={card.difficulty}
                  className="onb-card"
                  onMouseEnter={playMenuHover}
                  onClick={() => handleDifficultyChoose(card.difficulty)}
                  style={{
                    width: '100%',
                    background: card.glow,
                    border: `2px solid ${card.border}`,
                    borderRadius: 18,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    boxShadow: `0 4px 16px ${card.glow}`,
                  }}
                >
                  <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{card.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: card.accent }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{card.sub}</div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18 }}>›</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Back (step 2 only) ── */}
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              cursor: 'pointer', padding: '2px 0',
            }}
          >
            ← voltar
          </button>
        )}
        {step === 1 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Você pode mudar isso depois nas configurações.
          </p>
        )}
      </div>
    </>
  )
}
