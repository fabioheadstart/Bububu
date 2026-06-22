import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BububuCharacter } from '@/components/bububu/BububuCharacter'
import { getRandomProblem } from '@/data/problems'
import { useProgress } from '@/hooks/useProgress'
import { useTheme } from '@/hooks/useTheme'
import { useBububuVoice } from '@/lib/audio/useAudio'
import { playReveal, playSnap, playCoinNormal, playCoinBonus } from '@/lib/audio/sounds'
import type { Problem, ProblemPhase, DifficultyLevel, ChallengeResult } from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────────────
const SESSION_SIZE = 5
const XP = { high: 40, medium: 15 }

type UIPhase  = 'enigma' | 'options' | 'result' | 'done'
type BubState = 'idle' | 'eating' | 'celebrating'

function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

function buildSession(phase: ProblemPhase, difficulty: DifficultyLevel): Problem[] {
  const seen: string[] = []
  return Array.from({ length: SESSION_SIZE }, () => {
    const p = getRandomProblem(phase, difficulty, seen)
    seen.push(p.id)
    return p
  })
}

function streakLabel(n: number) {
  if (n === 2) return '🔥 2 seguidos!'
  if (n === 3) return '🔥🔥 Hat trick!'
  if (n >= 4)  return '⚡ Incrível!'
  return ''
}

// ─── Estilos base ─────────────────────────────────────────────────────────────
const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 20,
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ChallengeScreen() {
  const { progress, setDifficulty, markKidsChallengeComplete } = useProgress()
  const { speakBububu } = useBububuVoice()
  const phase: ProblemPhase = progress.mode === 'kids' ? 'kids' : 'adult'
  const theme  = useTheme()
  const isKids       = theme.isKids
  const todayKey     = new Date().toISOString().slice(0, 10)
  const kidsDoneToday = isKids && progress.lastKidsChallengeDate === todayKey

  const [showSettings, setShowSettings] = useState(false)

  const [session, setSession]             = useState<Problem[]>(() => buildSession(phase, progress.difficulty))
  const [sessionIdx, setSessionIdx]       = useState(0)
  const [sessionXp, setSessionXp]         = useState(0)
  const [consecutiveOk, setConsecutiveOk] = useState(0)
  const [maxStreak, setMaxStreak]         = useState(0)

  const [uiPhase, setUiPhase]         = useState<UIPhase>(isKids ? 'options' : 'enigma')
  const [result, setResult]           = useState<ChallengeResult | null>(null)
  const [hintVisible, setHintVisible] = useState(false)
  const [usedHint, setUsedHint]       = useState(false)
  const [bubState, setBubState]       = useState<BubState>('idle')
  const [choosing, setChoosing]       = useState(false)
  const [pressedOpt, setPressedOpt]   = useState<'A' | 'B' | null>(null)

  const [xpPops, setXpPops] = useState<{ id: number; amount: number }[]>([])
  const popId = { current: 0 }

  const problem = session[sessionIdx]
  const isHigh  = result != null && result.chosen === result.problem.options.find(o => o.score === 'high')?.key && !result.usedHint

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCardTap = useCallback(() => {
    if (uiPhase !== 'enigma') return
    playReveal()
    setUiPhase('options')
  }, [uiPhase])

  const handleHint = useCallback(() => {
    setHintVisible(true)
    setUsedHint(true)
  }, [])

  const handleChoose = useCallback(async (key: 'A' | 'B') => {
    if (choosing || uiPhase !== 'options') return
    setChoosing(true)
    setPressedOpt(null)

    const score          = problem.options.find(o => o.key === key)!.score
    const effectiveScore = (usedHint && !isKids) ? 'medium' : score
    const xp             = XP[effectiveScore as keyof typeof XP]
    const isCorrect      = score === 'high' && !usedHint

    const challengeResult: ChallengeResult = { problem, chosen: key, usedHint, xpGained: xp }

    playSnap()
    setBubState('eating')
    speakBububu()

    await delay(500)

    const newConsec = isCorrect ? consecutiveOk + 1 : 0
    setConsecutiveOk(newConsec)
    if (newConsec > maxStreak) setMaxStreak(newConsec)

    const id = ++popId.current
    setXpPops(prev => [...prev, { id, amount: xp }])
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 1000)

    setSessionXp(prev => prev + xp)
    setResult(challengeResult)
    setBubState(isCorrect ? 'celebrating' : 'idle')
    setUiPhase('result')

    await delay(300)
    if (isCorrect) playCoinBonus(); else playCoinNormal()

    setChoosing(false)
  }, [choosing, uiPhase, problem, usedHint, consecutiveOk, maxStreak, speakBububu, isKids])

  const handleNext = useCallback(() => {
    const next = sessionIdx + 1
    if (next >= SESSION_SIZE) {
      if (isKids) markKidsChallengeComplete()
      setUiPhase('done')
      return
    }
    setSessionIdx(next)
    setResult(null)
    setHintVisible(false)
    setUsedHint(false)
    setBubState('idle')
    setUiPhase(isKids ? 'options' : 'enigma')
  }, [sessionIdx, isKids, markKidsChallengeComplete])

  const handleNewSession = useCallback((diff?: DifficultyLevel) => {
    const d = diff ?? progress.difficulty
    setSession(buildSession(phase, d))
    setSessionIdx(0)
    setSessionXp(0)
    setConsecutiveOk(0)
    setMaxStreak(0)
    setResult(null)
    setHintVisible(false)
    setUsedHint(false)
    setBubState('idle')
    setUiPhase(isKids ? 'options' : 'enigma')
  }, [phase, progress.difficulty, isKids])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      height: '100%',
      background: isKids ? 'linear-gradient(170deg, #87CEEB 0%, #B0E0FF 35%, #B8F5D4 65%, #DDFFD4 100%)' : 'linear-gradient(170deg, #1a0533 0%, #2d1060 45%, #3b1a6e 100%)',
      padding: '8px 20px 24px',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* Estrelas decorativas */}
      <Stars isKids={isKids} />

      {/* Botão de configurações — oculto em kids */}
      {!isKids && <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1px solid ${isKids ? 'rgba(45,31,107,0.20)' : 'rgba(255,255,255,0.18)'}`,
            background: isKids ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)',
            color: isKids ? 'rgba(45,31,107,0.60)' : 'rgba(255,255,255,0.50)',
            fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >⚙️</button>

        {showSettings && createPortal(
          <>
            <div onClick={() => setShowSettings(false)} style={{ position: 'fixed', inset: 0, zIndex: 990 }} />
            <div style={{
              position: 'fixed', top: 56, right: 16,
              background: 'rgba(20,5,50,0.97)',
              border: '1px solid rgba(167,139,250,0.28)',
              borderRadius: 14, padding: '14px 16px',
              zIndex: 1000, minWidth: 190,
              animation: 'fadeSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                NÍVEL DO CHALLENGE
              </div>
              {([
                { d: 'easy'   as const, label: '🌱 Fácil' },
                { d: 'medium' as const, label: '⚡ Médio' },
                { d: 'hard'   as const, label: '🔥 Difícil' },
              ]).map(({ d, label }) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d)
                    handleNewSession(d)
                    setShowSettings(false)
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    width: '100%',
                    background: progress.difficulty === d ? 'rgba(124,58,237,0.35)' : 'transparent',
                    border: progress.difficulty === d ? '1px solid rgba(167,139,250,0.40)' : '1px solid transparent',
                    borderRadius: 9, padding: '8px 10px',
                    cursor: 'pointer', marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#e9d5ff' }}>{label}</span>
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
      </div>}

      {kidsDoneToday && uiPhase !== 'done' ? (
        <KidsLockedScreen />
      ) : (
        <>
          {/* Bububu + XP pops */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <BububuCharacter state={bubState} rewardTier={isHigh ? 'context_bonus' : undefined} onTap={speakBububu} />
            {xpPops.map(pop => (
              <div key={pop.id} style={{
                position: 'absolute', top: 8, left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 800, fontSize: 18,
                color: isKids ? '#f59e0b' : '#c4b5fd',
                pointerEvents: 'none', whiteSpace: 'nowrap',
                animation: 'xp-pop 0.95s ease-out forwards',
              }}>
                +{pop.amount} XP
              </div>
            ))}
          </div>

          {uiPhase === 'done'
            ? <SessionDone sessionXp={sessionXp} maxStreak={maxStreak} onNew={handleNewSession} isKids={isKids} kidsDoneToday={kidsDoneToday} />
            : (
              <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>

                {/* Progress */}
                <ProgressDots total={SESSION_SIZE} current={sessionIdx} isKids={isKids} />

                {/* Streak banner */}
                {consecutiveOk >= 2 && uiPhase !== 'result' && (
                  <div style={{
                    textAlign: 'center', fontSize: 14, fontWeight: 800,
                    color: isKids ? '#E07000' : '#c4b5fd', animation: 'streak-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  }}>
                    {streakLabel(consecutiveOk)}
                  </div>
                )}

                {uiPhase === 'enigma' && (
                  <EnigmaView problem={problem} onTap={handleCardTap} isKids={isKids} />
                )}

                {uiPhase === 'options' && (
                  <OptionsView
                    problem={problem}
                    hintVisible={hintVisible}
                    usedHint={usedHint}
                    choosing={choosing}
                    pressedOpt={pressedOpt}
                    onHint={handleHint}
                    onPressStart={setPressedOpt}
                    onChoose={handleChoose}
                    isKids={isKids}
                  />
                )}

                {uiPhase === 'result' && result && (
                  <ResultView result={result} onNext={handleNext} isKids={isKids} />
                )}
              </div>
            )
          }
        </>
      )}
    </div>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ isKids = false }: { isKids?: boolean }) {
  const dots = [
    { top: '8%',  left: '12%', s: 3, o: 0.6 },
    { top: '14%', left: '78%', s: 2, o: 0.4 },
    { top: '22%', left: '55%', s: 2, o: 0.5 },
    { top: '6%',  left: '40%', s: 4, o: 0.3 },
    { top: '30%', left: '88%', s: 2, o: 0.5 },
    { top: '18%', left: '25%', s: 3, o: 0.35 },
  ]
  return (
    <>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', top: d.top, left: d.left,
          width: d.s, height: d.s, borderRadius: '50%',
          background: isKids ? ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F43'][i % 6] : `rgba(255,255,255,${d.o})`,
          boxShadow: isKids ? 'none' : `0 0 ${d.s * 2}px rgba(255,255,255,${d.o})`,
          animation: `star-twinkle ${2.5 + i * 0.4}s ease-in-out infinite`,
          zIndex: 0,
        }} />
      ))}
    </>
  )
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ total, current, isKids = false }: { total: number; current: number; isKids?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '4px 0' }}>
      {Array.from({ length: total }, (_, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} style={{
            height: 7,
            width: active ? 20 : 7,
            borderRadius: 99,
            background: done ? (isKids ? '#6BCB77' : '#a78bfa') : active ? (isKids ? '#FF6B6B' : '#c4b5fd') : (isKids ? 'rgba(45,31,107,0.18)' : 'rgba(255,255,255,0.18)'),
            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        )
      })}
    </div>
  )
}

// Extrai o primeiro emoji de uma string (situação)
function extractLeadingEmoji(text: string): { emoji: string; rest: string } {
  const m = text.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u)
  if (m) return { emoji: m[0].trim(), rest: text.slice(m[0].length) }
  return { emoji: '', rest: text }
}

// ─── Fase 1: Enigma ───────────────────────────────────────────────────────────
function EnigmaView({ problem, onTap, isKids = false }: { problem: Problem; onTap: () => void; isKids?: boolean }) {
  const { emoji, rest } = isKids ? extractLeadingEmoji(problem.situation) : { emoji: '', rest: problem.situation }

  return (
    <div
      onClick={onTap}
      style={{
        ...(isKids ? {} : GLASS_CARD),
        background: isKids ? '#FFFFFF' : undefined,
        border: isKids ? '2.5px solid #FFD93D' : undefined,
        borderRadius: isKids ? 22 : 20,
        boxShadow: isKids ? '0 6px 24px rgba(255,217,61,0.22), 0 2px 0 rgba(0,0,0,0.04)' : undefined,
        padding: '24px 22px',
        cursor: 'pointer',
        animation: 'card-pulse 2.2s ease-in-out infinite, fadeSlideUp 0.35s ease',
        WebkitTapHighlightColor: 'transparent',
        textAlign: isKids ? 'center' : 'left',
      }}
    >
      {/* Emoji grande Kids */}
      {isKids && emoji && (
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 14 }}>{emoji}</div>
      )}

      {/* Categoria pill */}
      {!isKids && (
        <div style={{
          display: 'inline-block',
          fontSize: 10, fontWeight: 800,
          color: '#c4b5fd',
          background: 'rgba(196,181,253,0.12)',
          border: '1px solid rgba(196,181,253,0.22)',
          padding: '3px 10px', borderRadius: 99,
          letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16,
        }}>
          {problem.category}
        </div>
      )}

      <p style={{
        fontSize: isKids ? 19 : 17,
        lineHeight: 1.65,
        color: isKids ? '#2D1F6B' : 'rgba(255,255,255,0.92)',
        margin: 0,
        fontWeight: isKids ? 700 : 500,
        textAlign: isKids ? 'center' : 'left',
      }}>
        {isKids ? rest : problem.situation}
      </p>

      {/* Tap hint */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 22,
        color: isKids ? 'rgba(124,58,237,0.60)' : 'rgba(196,181,253,0.7)', fontSize: 13, fontWeight: 700,
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: '#a78bfa',
          animation: 'pulse-tap 1.3s ease-in-out infinite',
        }} />
        toque para ver suas opções
      </div>
    </div>
  )
}

// ─── Fase 2: Opções ───────────────────────────────────────────────────────────
interface OptionsViewProps {
  isKids?: boolean
  problem: Problem
  hintVisible: boolean
  usedHint: boolean
  choosing: boolean
  pressedOpt: 'A' | 'B' | null
  onHint: () => void
  onPressStart: (k: 'A' | 'B') => void
  onChoose: (k: 'A' | 'B') => void
}

function OptionsView({ problem, hintVisible, usedHint, choosing, pressedOpt, onHint, onPressStart, onChoose, isKids = false }: OptionsViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Situação — âncora visual da decisão */}
      <div style={{
        background: isKids
          ? 'rgba(255,255,255,0.92)'
          : 'rgba(255,255,255,0.05)',
        border: isKids
          ? '2px solid rgba(124,58,237,0.18)'
          : '1px solid rgba(196,181,253,0.20)',
        borderLeft: isKids
          ? '4px solid #a78bfa'
          : '3px solid rgba(167,139,250,0.55)',
        borderRadius: isKids ? 16 : 16,
        padding: '16px 18px',
        position: 'relative',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
          textTransform: 'uppercase', marginBottom: 8,
          color: isKids ? 'rgba(124,58,237,0.50)' : 'rgba(167,139,250,0.45)',
        }}>
          {problem.category}
        </div>
        <p style={{
          margin: 0,
          fontSize: 16,
          fontWeight: isKids ? 600 : 500,
          color: isKids ? '#2D1F6B' : 'rgba(255,255,255,0.90)',
          lineHeight: 1.65,
        }}>
          {problem.situation}
        </p>
      </div>

      {/* Botões — visual idêntico, sem hierarquia de cor */}
      {problem.options.map((opt, i) => {
        const pressed = pressedOpt === opt.key
        // Kids: cores e ícones distintos por opção (sem revelar qual é correta)
        const kidsIcon  = opt.key === 'A' ? '🔵' : '🟣'
        const kidsBg    = opt.key === 'A'
          ? (pressed ? 'rgba(59,130,246,0.14)' : 'rgba(219,234,254,0.95)')
          : (pressed ? 'rgba(124,58,237,0.14)' : 'rgba(237,233,254,0.95)')
        const kidsBorder = opt.key === 'A'
          ? '2.5px solid rgba(59,130,246,0.35)'
          : '2.5px solid rgba(124,58,237,0.35)'
        const kidsBoxShadow = pressed ? 'none'
          : opt.key === 'A'
            ? '0 5px 0 rgba(59,130,246,0.20), 0 8px 20px rgba(59,130,246,0.10)'
            : '0 5px 0 rgba(124,58,237,0.20), 0 8px 20px rgba(124,58,237,0.10)'

        return (
          <button
            key={opt.key}
            disabled={choosing}
            onPointerDown={() => !choosing && onPressStart(opt.key)}
            onPointerUp={() => !choosing && onChoose(opt.key)}
            onPointerLeave={() => onPressStart(null as unknown as 'A')}
            style={{
              padding: isKids ? '20px 18px' : '18px 20px',
              borderRadius: 18,
              border: isKids ? kidsBorder : '1px solid rgba(255,255,255,0.15)',
              textAlign: 'left',
              fontSize: isKids ? 16 : 15,
              fontWeight: isKids ? 700 : 600,
              lineHeight: 1.5,
              color: isKids ? '#2D1F6B' : 'rgba(255,255,255,0.93)',
              cursor: choosing ? 'default' : 'pointer',
              WebkitTapHighlightColor: 'transparent',
              display: 'flex', alignItems: 'flex-start', gap: 14,
              animation: `burst-in 0.42s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both`,
              background: isKids ? kidsBg : (pressed ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.07)'),
              backdropFilter: isKids ? 'none' : 'blur(14px)',
              WebkitBackdropFilter: isKids ? 'none' : 'blur(14px)',
              transform: pressed ? 'translateY(3px) scale(0.985)' : 'translateY(0) scale(1)',
              boxShadow: isKids ? kidsBoxShadow : (pressed ? 'none' : '0 4px 0 rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)'),
              transition: pressed ? 'none' : 'transform 0.14s, box-shadow 0.14s, background 0.14s',
              opacity: choosing ? 0.75 : 1,
            }}
          >
            {/* Ícone Kids grande / Label Pro pequeno */}
            {isKids ? (
              <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{kidsIcon}</span>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: 'rgba(196,181,253,0.18)',
                border: '1px solid rgba(196,181,253,0.30)',
                fontWeight: 900, fontSize: 12, color: '#c4b5fd',
              }}>
                {opt.key}
              </span>
            )}
            <span style={{ paddingTop: isKids ? 4 : 3 }}>{opt.text}</span>
          </button>
        )
      })}

      {/* Hint */}
      {!hintVisible ? (
        <button onClick={onHint} style={{
          background: 'none', border: 'none',
          color: isKids ? 'rgba(124,58,237,0.60)' : 'rgba(196,181,253,0.65)',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          padding: '2px 0', alignSelf: 'center', opacity: usedHint ? 0.45 : 1,
        }}>
          💡 ver dica {usedHint && !isKids ? '(XP reduzido)' : ''}
        </button>
      ) : (
        <div style={{
          background: isKids ? 'rgba(255,240,180,0.90)' : 'rgba(253,230,138,0.08)',
          border: isKids ? '1.5px solid #FFD93D' : '1px solid rgba(253,230,138,0.18)',
          borderRadius: 14, padding: '12px 16px',
          fontSize: 13, color: isKids ? '#7C5200' : 'rgba(253,230,138,0.85)', lineHeight: 1.6,
          animation: 'fadeSlideUp 0.25s ease',
        }}>
          💡 {problem.hint}
        </div>
      )}
    </div>
  )
}

// ─── Fase 3: Resultado ────────────────────────────────────────────────────────
function ResultView({ result, onNext, isKids = false }: { result: ChallengeResult; onNext: () => void; isKids?: boolean }) {
  const { chosen, usedHint, xpGained, problem } = result
  const chosenOption = problem.options.find(o => o.key === chosen)!
  const otherOption  = problem.options.find(o => o.key !== chosen)!
  const choseWrong   = chosenOption.score === 'medium'
  const isHigh       = !choseWrong && !usedHint
  const isBwithHint  = !choseWrong && usedHint

  // Emoji, título e subtítulo variam por caso
  const feedbackEmoji = isHigh ? (isKids ? '🎉' : '🔥') : isBwithHint ? '✅' : (isKids ? '💪' : '👍')
  const feedbackTitle = isHigh ? (isKids ? 'Arrasou!' : 'Perfeito!') : isBwithHint ? 'Certo!' : (isKids ? 'Quase lá!' : 'Funciona!')
  const feedbackSub   = isHigh
    ? (isKids ? 'Essa é a resposta mais legal! 🌟' : 'É exatamente o que um nativo diria.')
    : isBwithHint
      ? (isKids ? 'Você acertou! Mas tente sem dica da próxima vez 😊' : 'Você acertou, mas precisou da dica desta vez.')
      : (isKids ? 'Funciona! Mas a outra opção seria mais natural 👇' : `Funciona, mas ${otherOption.key} seria mais natural.`)

  // Cores do card de feedback
  const fbBgKids   = isHigh ? 'linear-gradient(135deg, #D6F5D6, #B8F0C8)' : isBwithHint ? 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' : '#FFF9E6'
  const fbBorderKids = isHigh ? '2px solid #6BCB77' : isBwithHint ? '2px solid #4D96FF' : '2px solid #FFD93D'
  const fbColorKids  = isHigh ? '#166534' : isBwithHint ? '#1E3A8A' : '#7C5200'
  const fbBgPro     = isHigh
    ? 'linear-gradient(135deg, rgba(22,101,52,0.50), rgba(34,197,94,0.25))'
    : isBwithHint
      ? 'linear-gradient(135deg, rgba(30,58,138,0.50), rgba(59,130,246,0.25))'
      : 'rgba(255,255,255,0.06)'
  const fbBorderPro = isHigh
    ? '1px solid rgba(34,197,94,0.45)'
    : isBwithHint
      ? '1px solid rgba(59,130,246,0.45)'
      : '1px solid rgba(255,255,255,0.12)'
  const fbColorPro  = isHigh ? '#86efac' : isBwithHint ? '#93c5fd' : 'rgba(255,255,255,0.9)'
  const fbSubPro    = isHigh ? 'rgba(134,239,172,0.75)' : isBwithHint ? 'rgba(147,197,253,0.75)' : 'rgba(255,255,255,0.55)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeSlideUp 0.3s ease' }}>

      {/* Feedback principal */}
      <div style={{
        borderRadius: 20, padding: '20px 20px', textAlign: 'center',
        background: isKids ? fbBgKids : fbBgPro,
        border: isKids ? fbBorderKids : fbBorderPro,
        backdropFilter: isKids ? 'none' : 'blur(14px)',
        WebkitBackdropFilter: isKids ? 'none' : 'blur(14px)',
        boxShadow: isKids
          ? (isHigh ? '0 4px 20px rgba(255,107,107,0.20)' : isBwithHint ? '0 4px 20px rgba(107,203,119,0.20)' : '0 4px 12px rgba(255,217,61,0.15)')
          : (isHigh ? '0 0 40px rgba(124,58,237,0.25)' : 'none'),
      }}>
        <div style={{ fontSize: isKids ? 64 : 38, marginBottom: 8, lineHeight: 1 }}>{feedbackEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 5, color: isKids ? fbColorKids : fbColorPro }}>
          {feedbackTitle}
        </div>
        <div style={{ fontSize: 13, color: isKids ? fbColorKids : fbSubPro }}>
          {feedbackSub}
        </div>
      </div>

      {/* Opção escolhida */}
      <div style={{
        ...(isKids ? {} : GLASS_CARD),
        background: isKids ? '#fff' : undefined,
        border: isKids
          ? `2px solid ${!choseWrong ? '#6BCB77' : '#FFD93D'}`
          : `1px solid ${!choseWrong ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 16,
        padding: '14px 16px',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6,
          color: isKids ? (!choseWrong ? '#166534' : '#7C5200') : 'rgba(196,181,253,0.6)',
        }}>
          Você escolheu {chosen}
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontStyle: 'italic', color: isKids ? '#2D1F6B' : 'rgba(255,255,255,0.85)' }}>
          "{chosenOption.text}"
        </p>
      </div>

      {/* Se escolheu a opção menos natural, mostra a melhor */}
      {choseWrong && (
        <div style={{
          background: isKids ? 'rgba(107,203,119,0.10)' : 'rgba(167,139,250,0.10)',
          border: isKids ? '2px solid rgba(107,203,119,0.35)' : '1px solid rgba(167,139,250,0.25)',
          borderRadius: 16, padding: '14px 16px',
          backdropFilter: isKids ? 'none' : 'blur(10px)',
          WebkitBackdropFilter: isKids ? 'none' : 'blur(10px)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, color: isKids ? '#166534' : '#c4b5fd' }}>
            {otherOption.key} seria mais natural
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontStyle: 'italic', color: isKids ? '#2D1F6B' : 'rgba(255,255,255,0.88)' }}>
            "{otherOption.text}"
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: isKids ? '#444' : 'rgba(196,181,253,0.75)' }}>
            {problem.hint}
          </p>
        </div>
      )}

      {/* XP badge */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: 13, fontWeight: 800,
          color: isKids ? '#E07000' : '#c4b5fd',
          background: isKids ? 'rgba(255,159,67,0.12)' : 'rgba(196,181,253,0.12)',
          border: isKids ? '1px solid rgba(255,159,67,0.30)' : '1px solid rgba(196,181,253,0.25)',
          padding: '5px 16px', borderRadius: 99,
        }}>
          +{xpGained} XP {usedHint && <span style={{ opacity: 0.6, fontSize: 11 }}>(dica)</span>}
        </span>
      </div>

      <button
        onClick={onNext}
        style={{
          padding: '16px', borderRadius: 16, border: 'none',
          background: isKids
            ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
            : 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: isKids ? '#2D1F6B' : '#fff',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: isKids
            ? '0 5px 0 #b45309, 0 8px 24px rgba(245,158,11,0.30)'
            : '0 5px 0 #4c1d95, 0 8px 24px rgba(124,58,237,0.3)',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onPointerDown={e => {
          e.currentTarget.style.transform = 'translateY(4px)'
          e.currentTarget.style.boxShadow = isKids ? '0 1px 0 #b45309' : '0 1px 0 #4c1d95'
        }}
        onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
      >
        Próximo →
      </button>
    </div>
  )
}

// ─── Tela de trava diária (kids já treinou hoje) ──────────────────────────────
function KidsLockedScreen() {
  return (
    <div style={{
      textAlign: 'center', zIndex: 1, padding: '40px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🌙</div>
      <div style={{ fontWeight: 900, fontSize: 22, color: '#2D1F6B' }}>
        Missão do dia completa!
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.80)',
        border: '2px solid rgba(124,58,237,0.20)',
        borderRadius: 18, padding: '16px 24px',
        fontSize: 15, color: 'rgba(45,31,107,0.65)', lineHeight: 1.7, maxWidth: 320,
      }}>
        Você já treinou hoje. Volte amanhã para a próxima missão! 💪
      </div>
    </div>
  )
}

// ─── Fase 4: Sessão completa ──────────────────────────────────────────────────
function SessionDone({ sessionXp, maxStreak, onNew, isKids = false, kidsDoneToday = false }: { sessionXp: number; maxStreak: number; onNew: () => void; isKids?: boolean; kidsDoneToday?: boolean }) {
  return (
    <div style={{
      width: '100%', maxWidth: 400, textAlign: 'center',
      animation: 'session-done 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1,
    }}>
      <div style={{ fontSize: 64, lineHeight: 1 }}>🎉</div>

      <div style={{
        ...(isKids ? {} : GLASS_CARD),
        padding: '24px 20px',
        background: isKids ? '#fff' : undefined,
        border: isKids ? '2.5px solid #FFD93D' : '1px solid rgba(167,139,250,0.3)',
        borderRadius: 22,
        boxShadow: isKids ? '0 8px 32px rgba(255,217,61,0.20)' : undefined,
      }}>
        <div style={{ fontWeight: 900, fontSize: 24, color: isKids ? '#2D1F6B' : '#e9d5ff', marginBottom: 4 }}>
          Sessão completa!
        </div>
        <div style={{ fontSize: 14, color: isKids ? 'rgba(45,31,107,0.55)' : 'rgba(196,181,253,0.7)', marginBottom: 20 }}>
          {SESSION_SIZE}/{SESSION_SIZE} problemas resolvidos
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{
            background: isKids ? 'rgba(245,158,11,0.10)' : 'rgba(167,139,250,0.12)',
            border: isKids ? '1.5px solid rgba(245,158,11,0.25)' : '1px solid rgba(167,139,250,0.2)',
            borderRadius: 14, padding: '14px 12px',
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: isKids ? '#b45309' : '#c4b5fd' }}>{sessionXp}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isKids ? 'rgba(180,83,9,0.6)' : 'rgba(196,181,253,0.6)', letterSpacing: 0.5 }}>XP total</div>
          </div>
          <div style={{
            background: 'rgba(251,191,36,0.08)',
            border: isKids ? '1.5px solid rgba(251,191,36,0.30)' : '1px solid rgba(251,191,36,0.18)',
            borderRadius: 14, padding: '14px 12px',
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>
              {maxStreak >= 3 ? '🔥' : ''}{maxStreak}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(251,191,36,0.65)', letterSpacing: 0.5 }}>maior streak</div>
          </div>
        </div>

        {isKids && kidsDoneToday ? (
          <div style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: 'rgba(45,31,107,0.08)',
            border: '2px solid rgba(45,31,107,0.15)',
            color: 'rgba(45,31,107,0.45)',
            fontSize: 16, fontWeight: 800, textAlign: 'center',
          }}>
            Volte amanhã! 🌙
          </div>
        ) : (
          <button
            onClick={onNew}
            style={{
              width: '100%', padding: '16px', borderRadius: 16, border: 'none',
              background: isKids
                ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: isKids ? '#2D1F6B' : '#fff',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: isKids
                ? '0 5px 0 #b45309, 0 8px 24px rgba(245,158,11,0.30)'
                : '0 5px 0 #4c1d95, 0 8px 24px rgba(124,58,237,0.3)',
              WebkitTapHighlightColor: 'transparent',
            }}
            onPointerDown={e => {
              e.currentTarget.style.transform = 'translateY(4px)'
              e.currentTarget.style.boxShadow = isKids ? '0 1px 0 #b45309' : '0 1px 0 #4c1d95'
            }}
            onPointerUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
          >
            Nova sessão 🎮
          </button>
        )}
      </div>
    </div>
  )
}
