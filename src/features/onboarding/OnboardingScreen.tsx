import { useState, useEffect } from 'react'
import { useProgress } from '@/hooks/useProgress'
import { playMenuHover } from '@/lib/audio/sounds'
import { BububuCharacter } from '@/components/bububu/BububuCharacter'
import type { AppMode, DifficultyLevel } from '@/types'

const STORY: { id: number; text: string; delay: number }[] = [
  { id: 1, text: 'Oi! Eu sou o Bububu 👋',                                                        delay: 300  },
  { id: 2, text: 'Nasci em São Sebastião do Rio Verde, Minas Gerais 🌄',                           delay: 900  },
  { id: 3, text: 'Cidade pequena. Mas mundo grande 🌎',                                            delay: 1600 },
  { id: 4, text: 'O Vini Jr. era de Madureira. O Neymar era de Mogi das Cruzes. Eu sou de São Sebastião. ⚽', delay: 2300 },
  { id: 5, text: 'A gente não nasceu pra ficar. Me alimenta com inglês — e a gente vai junto 🌟', delay: 3400 },
]
const CTA_DELAY = 4700

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
    icon: '👑',
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
  const { setMode, setDifficulty, setUserName } = useProgress()
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [ctaVisible, setCtaVisible] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (step !== 0) return
    const t = setTimeout(() => setCtaVisible(true), CTA_DELAY)
    return () => clearTimeout(t)
  }, [step])

  function handleNameSubmit() {
    const name = nameInput.trim()
    if (!name) return
    setUserName(name)
    setStep(2)
  }

  function handleModeChoose(mode: AppMode) {
    setMode(mode)
    setStep(3)
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
        @keyframes msg-pop {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes cta-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        overflowY: 'auto',
        padding: '40px 24px',
        gap: 28,
        background: 'linear-gradient(160deg, #0a041e 0%, #130826 60%, #0d0520 100%)',
      }}>

        {/* ── Mascote (step 0: maior + sem texto abaixo; steps 1/2: menor) ── */}
        <div style={{ textAlign: 'center' }}>
          <div className="bub-mascot" style={{
            width: step === 0 ? 160 : 140,
            height: step === 0 ? 180 : 160,
            margin: '0 auto',
            transition: 'all 0.4s ease',
          }}>
            <BububuCharacter state="idle" />
          </div>
          {step === 0 ? (
            <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, margin: '10px 0 0', color: '#f0e6ff' }}>
              Bububu
            </h1>
          ) : (
            <>
              <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, margin: '10px 0 4px', color: '#f0e6ff' }}>
                Bububu
              </h1>
              <p style={{ color: 'rgba(196,132,252,0.7)', fontSize: 14, margin: 0 }}>
                Me dê palavras em inglês e eu vou crescer com você.
              </p>
            </>
          )}
        </div>

        {/* ── Step indicators (steps 1, 2, 3) ── */}
        {step > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                height: 6, borderRadius: 99,
                width: step === s ? 24 : 8,
                background: step >= s ? '#c084fc' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            ))}
          </div>
        )}

        {/* ── Step 0: História do Bububu ── */}
        {step === 0 && (
          <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STORY.map(msg => (
              <div key={msg.id} style={{
                display: 'flex', alignItems: 'flex-end', gap: 10,
                animation: `msg-pop 0.38s cubic-bezier(0.34,1.56,0.64,1) ${msg.delay}ms both`,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(124,58,237,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>🫧</div>
                <div style={{
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(167,139,250,0.18)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '10px 14px',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.5,
                  maxWidth: '85%',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* CTA — aparece após as mensagens */}
            {ctaVisible && (
              <button
                onClick={() => setStep(1)}
                style={{
                  marginTop: 12,
                  alignSelf: 'center',
                  padding: '14px 36px',
                  borderRadius: 99,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.45)',
                  animation: 'cta-in 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Vamos começar! 🚀
              </button>
            )}
          </div>
        )}

        {/* ── Step 1: Qual é o seu nome? ── */}
        {step === 1 && (
          <div className="slide-in" style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.85)', margin: 0, textAlign: 'center' }}>
              Qual é o seu nome?
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '-6px 0 4px', textAlign: 'center' }}>
              O Bububu vai te chamar pelo nome 🫧
            </p>
            <input
              autoFocus
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Digite seu nome..."
              maxLength={24}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 16,
                border: '2px solid rgba(192,132,252,0.35)',
                background: 'rgba(124,58,237,0.12)',
                color: '#f0e6ff',
                fontSize: 18,
                fontWeight: 700,
                outline: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              style={{
                padding: '14px 40px',
                borderRadius: 99,
                border: 'none',
                background: nameInput.trim()
                  ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                  : 'rgba(255,255,255,0.08)',
                color: nameInput.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                fontSize: 16,
                fontWeight: 800,
                cursor: nameInput.trim() ? 'pointer' : 'default',
                boxShadow: nameInput.trim() ? '0 8px 32px rgba(124,58,237,0.45)' : 'none',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── Step 2: Quem vai jogar? ── */}
        {step === 2 && (
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

        {/* ── Step 3: Qual é o seu nível? ── */}
        {step === 3 && (
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

        {/* ── Back / hint ── */}
        {step === 3 && (
          <button
            onClick={() => setStep(2)}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              cursor: 'pointer', padding: '2px 0',
            }}
          >
            ← voltar
          </button>
        )}
        {step === 2 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Você pode mudar isso depois nas configurações.
          </p>
        )}
      </div>
    </>
  )
}
