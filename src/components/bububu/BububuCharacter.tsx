import { useState, useCallback, useRef, useEffect } from 'react'
import type { RewardTier } from '@/types'

export type BubState = 'idle' | 'eating' | 'celebrating' | 'sleeping' | 'sad' | 'yawning' | 'pooping'
type TapReaction  = 'squish' | 'jiggle' | 'bounce' | 'spin'

const TAP_REACTIONS: TapReaction[] = ['squish', 'jiggle', 'bounce', 'spin']
const TAP_PARTICLES = ['⭐', '💜', '✨', '💫', '🌟', '💕']

// Easter egg: 10 taps = mega fart
const MEGA_FART_THRESHOLD = 10
const TAP_WINDOW_MS       = 12_000  // janela de 12 segundos

// Jackpot — 10 partículas grandes voando do corpo
const JACKPOT_ANGLES = Array.from({ length: 10 }, (_, i) => (360 / 10) * i)
const JACKPOT_EMOJIS = ['⭐', '🌟', '✨', '💫', '⚡', '💥', '🎆', '🎇', '⭐', '✨']

interface Particle { id: number; emoji: string; x: number; y: number }
interface JackpotParticle {
  id: number; emoji: string
  dx: number; dy: number
  size: number; dur: number
}

interface Props {
  state: BubState
  rewardTier?: RewardTier
  onTap?: () => void
  onMegaFart?: () => void   // callback para tocar sons na FeedScreen
  hungry?: boolean
  level?: number            // nível CEFR — fallback quando wordCount não fornecido
  wordCount?: number        // palavras aprendidas — controla estágio visual (preferencial)
  jackpotKey?: number       // incrementar para disparar explosão jackpot
}

// ── Estágios de evolução ───────────────────────────────────────────────────────
export type EvolutionStage = 'baby' | 'growing' | 'teen' | 'adult'

/** Estágio baseado em nível CEFR — usado para voz e desbloqueio de conteúdo */
export function getStage(level: number): EvolutionStage {
  if (level >= 15) return 'adult'
  if (level >= 10) return 'teen'
  if (level >= 5)  return 'growing'
  return 'baby'
}

/** Estágio visual baseado em palavras aprendidas — responde rápido, independente do CEFR */
export function getVisualStage(wordCount: number): EvolutionStage {
  if (wordCount >= 40) return 'adult'
  if (wordCount >= 15) return 'teen'
  if (wordCount >= 5)  return 'growing'
  return 'baby'
}

const STAGE_CONFIG: Record<EvolutionStage, {
  scale: number
  baseColor: string
  eyeScale: number
}> = {
  baby:    { scale: 0.52, baseColor: '#ddd6fe', eyeScale: 0.65 },  // visivelmente pequeno
  growing: { scale: 0.72, baseColor: '#c4b5fd', eyeScale: 0.82 },  // crescendo
  teen:    { scale: 1.00, baseColor: '#a78bfa', eyeScale: 1.00 },
  adult:   { scale: 1.00, baseColor: '#8b5cf6', eyeScale: 1.00 },
}

function Mouth({ state, squeezed }: { state: BubState; squeezed: boolean }) {
  if (state === 'eating') {
    return <ellipse cx="60" cy="80" rx="14" ry="11" fill="#1a1a2e" />
  }
  if (state === 'celebrating') {
    return (
      <path d="M 42 76 Q 60 96 78 76"
        stroke="#1a1a2e" strokeWidth="3.5" fill="#ff8fab" strokeLinecap="round" />
    )
  }
  if (state === 'sleeping') {
    // Boquinha relaxada e levemente aberta
    return (
      <path d="M 52 80 Q 60 84 68 80"
        stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    )
  }
  if (state === 'yawning') {
    // Bocão aberto
    return (
      <>
        <ellipse cx="60" cy="82" rx="16" ry="13" fill="#1a1a2e" />
        <ellipse cx="60" cy="85" rx="10" ry="7" fill="#7c3aed" opacity="0.4" />
      </>
    )
  }
  if (state === 'sad') {
    // Boca curva pra baixo
    return (
      <path d="M 46 82 Q 60 74 74 82"
        stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
    )
  }
  if (state === 'pooping') {
    // Grimace de esforço — boca fechada tensa, cantos presos
    return (
      <>
        <path d="M 48 79 Q 60 83 72 79"
          stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 48 79 Q 60 75 72 79"
          stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
      </>
    )
  }
  if (squeezed) {
    return <ellipse cx="60" cy="79" rx="8" ry="6" fill="#1a1a2e" />
  }
  return (
    <path d="M 48 76 Q 60 86 72 76"
      stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
  )
}

function Eyes({ state, squeezed, hungry }: { state: BubState; squeezed: boolean; hungry?: boolean }) {
  if (state === 'celebrating') {
    return (
      <>
        <path d="M 36 50 Q 44 42 52 50" stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 68 50 Q 76 42 84 50" stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    )
  }
  if (state === 'eating') {
    return (
      <>
        <ellipse cx="44" cy="50" rx="8" ry="5" fill="#1a1a2e" />
        <ellipse cx="76" cy="50" rx="8" ry="5" fill="#1a1a2e" />
        <circle cx="41" cy="48" r="2.5" fill="white" />
        <circle cx="73" cy="48" r="2.5" fill="white" />
      </>
    )
  }
  if (state === 'sleeping') {
    // Olhos fechados — linhas curvas pra baixo (dormindo)
    return (
      <>
        <path d="M 36 50 Q 44 56 52 50" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 68 50 Q 76 56 84 50" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    )
  }
  if (state === 'yawning') {
    // Um olho meio fechado, outro tentando abrir
    return (
      <>
        {/* Olho esquerdo meio fechado */}
        <ellipse cx="44" cy="50" rx="8" ry="4" fill="#1a1a2e" />
        <circle cx="42" cy="49" r="2" fill="white" />
        {/* Olho direito quase fechado */}
        <ellipse cx="76" cy="51" rx="8" ry="3" fill="#1a1a2e" />
        <circle cx="74" cy="50" r="1.5" fill="white" />
      </>
    )
  }
  if (state === 'pooping') {
    // Olhos semicerrados de esforço + sobrancelhas franzidas no centro
    return (
      <>
        <path d="M 36 42 Q 44 47 52 43" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 68 43 Q 76 47 84 42" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="44" cy="51" rx="8" ry="4" fill="#1a1a2e" />
        <ellipse cx="76" cy="51" rx="8" ry="4" fill="#1a1a2e" />
        <circle cx="42" cy="50" r="2" fill="white" />
        <circle cx="74" cy="50" r="2" fill="white" />
      </>
    )
  }
  if (state === 'sad') {
    // Olhos com sobrancelhas descidas e tristes
    return (
      <>
        {/* Sobrancelhas tristes */}
        <path d="M 36 38 Q 44 44 52 40" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 68 40 Q 76 44 84 38" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Olhos tristes olhando pra baixo */}
        <circle cx="44" cy="52" r="8" fill="#1a1a2e" />
        <circle cx="76" cy="52" r="8" fill="#1a1a2e" />
        <circle cx="41" cy="53" r="3" fill="white" />
        <circle cx="73" cy="53" r="3" fill="white" />
        {/* Gotinha */}
        <ellipse cx="52" cy="67" rx="3" ry="4" fill="rgba(147,197,253,0.80)" />
      </>
    )
  }
  if (squeezed) {
    return (
      <>
        <path d="M 38 44 L 50 56 M 50 44 L 38 56" stroke="#1a1a2e" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 70 44 L 82 56 M 82 44 L 70 56" stroke="#1a1a2e" strokeWidth="3.5" strokeLinecap="round" />
      </>
    )
  }
  if (hungry) {
    return (
      <>
        {/* Sobrancelhas levantadas — súplica */}
        <path d="M 34 36 Q 44 30 54 36" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 66 36 Q 76 30 86 36" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Olhos grandes suplicantes */}
        <circle cx="44" cy="51" r="11" fill="#1a1a2e" />
        <circle cx="76" cy="51" r="11" fill="#1a1a2e" />
        {/* Reflexos grandes — olhos brilhantes de fome */}
        <circle cx="39" cy="46" r="4.5" fill="white" />
        <circle cx="71" cy="46" r="4.5" fill="white" />
        <circle cx="50" cy="55" r="2"   fill="white" opacity="0.55" />
        <circle cx="82" cy="55" r="2"   fill="white" opacity="0.55" />
      </>
    )
  }
  return (
    <>
      <circle cx="44" cy="50" r="9" fill="#1a1a2e" />
      <circle cx="76" cy="50" r="9" fill="#1a1a2e" />
      <circle cx="41" cy="47" r="3" fill="white" />
      <circle cx="73" cy="47" r="3" fill="white" />
    </>
  )
}

export function BububuCharacter({ state, rewardTier, onTap, onMegaFart, hungry, level = 1, wordCount, jackpotKey = 0 }: Props) {
  const stage  = wordCount !== undefined ? getVisualStage(wordCount) : getStage(level)
  const stageCfg = STAGE_CONFIG[stage]
  const [tapReaction, setTapReaction]   = useState<TapReaction | null>(null)
  const [particles, setParticles]       = useState<Particle[]>([])
  const [megaFart, setMegaFart]         = useState(false)
  const [jackpotActive, setJackpotActive]   = useState(false)
  const [jackpotParticles, setJackpotParticles] = useState<JackpotParticle[]>([])
  const jackpotTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const jackpotPId   = useRef(0)

  // Dispara explosão visual quando jackpotKey muda (mas não na montagem inicial)
  const prevJackpotKey = useRef(jackpotKey)
  useEffect(() => {
    if (jackpotKey === prevJackpotKey.current) return
    prevJackpotKey.current = jackpotKey

    setJackpotActive(true)
    clearTimeout(jackpotTimer.current)
    jackpotTimer.current = setTimeout(() => setJackpotActive(false), 1300)

    // Gera 10 partículas grandes em ângulos distribuídos
    const newPs: JackpotParticle[] = JACKPOT_ANGLES.map((angle, i) => {
      const dist = 80 + (i % 3) * 30   // 80–140px
      const rad  = (angle * Math.PI) / 180
      return {
        id:    ++jackpotPId.current,
        emoji: JACKPOT_EMOJIS[i],
        dx:    Math.cos(rad) * dist,
        dy:    Math.sin(rad) * dist,
        size:  20 + (i % 3) * 6,       // 20–32px
        dur:   0.7 + (i % 4) * 0.1,    // 0.7–1.0s
      }
    })
    setJackpotParticles(newPs)
    setTimeout(() => setJackpotParticles([]), 1100)
  }, [jackpotKey])
  const tapTimeout    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const megaFartTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tapWindowTimer= useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const particleId    = useRef(0)
  const tapCount      = useRef(0)

  // Não reagir a tap quando dormindo ou triste demais
  const canTap = state !== 'sleeping'

  const bodyColor = (() => {
    if (megaFart)             return '#86efac'   // verde tóxico no mega fart
    if (state === 'sleeping') return '#9f7aea'
    if (state === 'sad')      return '#a5b4fc'
    if (rewardTier === 'jackpot')       return '#ddd6fe'
    if (rewardTier === 'context_bonus') return '#fde68a'
    return stageCfg.baseColor           // cor do estágio de evolução
  })()

  const stageGlow = stage === 'adult'
    ? 'drop-shadow(0 0 22px rgba(245,158,11,0.65)) drop-shadow(0 0 44px rgba(245,158,11,0.30))'
    : stage === 'teen'
    ? 'drop-shadow(0 0 16px rgba(251,191,36,0.55)) drop-shadow(0 0 32px rgba(251,191,36,0.22))'
    : stage === 'growing'
    ? 'drop-shadow(0 0 10px rgba(167,139,250,0.35))'
    : ''

  const shadowColor = tapReaction
    ? 'rgba(124,58,237,0.50)'
    : state === 'sleeping'
    ? 'rgba(124,58,237,0.10)'
    : state === 'sad'
    ? 'rgba(100,116,200,0.20)'
    : rewardTier === 'jackpot'
    ? 'rgba(139,92,246,0.35)'
    : rewardTier === 'context_bonus'
    ? 'rgba(251,191,36,0.35)'
    : 'rgba(124,58,237,0.20)'

  const handleClick = useCallback(() => {
    if (!canTap) return
    if (onTap) onTap()

    // ── Easter egg counter ──────────────────────────────────────────────────
    tapCount.current += 1
    clearTimeout(tapWindowTimer.current)
    tapWindowTimer.current = setTimeout(() => { tapCount.current = 0 }, TAP_WINDOW_MS)

    if (tapCount.current >= MEGA_FART_THRESHOLD) {
      tapCount.current = 0
      clearTimeout(tapWindowTimer.current)
      setMegaFart(true)
      onMegaFart?.()
      clearTimeout(megaFartTimer.current)
      megaFartTimer.current = setTimeout(() => setMegaFart(false), 3200)
      return   // pula reação normal
    }

    // ── Reação normal ───────────────────────────────────────────────────────
    const reaction = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)]
    setTapReaction(reaction)
    clearTimeout(tapTimeout.current)
    tapTimeout.current = setTimeout(() => setTapReaction(null), 580)

    const newParticles: Particle[] = Array.from({ length: 3 }, () => ({
      id:    ++particleId.current,
      emoji: TAP_PARTICLES[Math.floor(Math.random() * TAP_PARTICLES.length)],
      x:     Math.random() * 120 - 10,
      y:     Math.random() * 40 + 10,
    }))
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)))
    }, 750)
  }, [onTap, onMegaFart, canTap])

  const squeezed = tapReaction === 'squish'

  const animation = (() => {
    if (jackpotActive) return 'bub-jackpot 1.3s cubic-bezier(0.34, 1.56, 0.64, 1) 1'
    if (tapReaction) {
      const dur  = tapReaction === 'squish' ? '0.45s' : '0.52s'
      const ease = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      return `bub-${tapReaction} ${dur} ${ease} 1`
    }
    if (state === 'eating')      return 'bub-munch 1.05s ease-in-out 1'
    if (state === 'celebrating') return 'bub-celebrate 0.6s ease-in-out infinite'
    if (state === 'sleeping')    return 'bub-float 5s ease-in-out infinite'
    if (state === 'yawning')     return 'bub-munch 1.2s ease-in-out 1'
    if (state === 'sad')         return 'bub-sad 3s ease-in-out infinite'
    if (state === 'pooping')     return 'bub-poop 0.95s cubic-bezier(0.36,0.07,0.19,0.97) 1'
    if (hungry)                  return 'bub-hungry 2s ease-in-out infinite'
    return 'bub-float 3s ease-in-out infinite'
  })()

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: canTap ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        opacity: state === 'sleeping' ? 0.75 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x, top: p.y,
            fontSize: 18,
            pointerEvents: 'none',
            animation: 'bub-particle 0.75s ease-out forwards',
            zIndex: 10,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Jackpot — partículas grandes voando do centro do corpo */}
      {jackpotParticles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            fontSize: p.size,
            pointerEvents: 'none',
            zIndex: 20,
            animation: `bub-jackpot-particle ${p.dur}s ease-out forwards`,
            ['--jdx' as string]: `${p.dx}px`,
            ['--jdy' as string]: `${p.dy}px`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}

      {/* MEGA FART — fumaça tóxica */}
      {megaFart && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
          {/* Emoji de texto flutuando */}
          <div style={{
            position: 'absolute', top: -30, left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 15, fontWeight: 900, whiteSpace: 'nowrap',
            color: '#4ade80',
            animation: 'mega-fart-text 3.2s ease-out forwards',
          }}>
            💨 SUPER PEIDO 💨
          </div>

          {/* Nuvens de fumaça — saem de baixo/trás */}
          {[
            { size: 80,  left: '10%',  delay: '0s',    dur: '2.8s' },
            { size: 110, left: '30%',  delay: '0.15s', dur: '3.0s' },
            { size: 95,  left: '55%',  delay: '0.05s', dur: '2.6s' },
            { size: 130, left: '20%',  delay: '0.3s',  dur: '3.2s' },
            { size: 70,  left: '65%',  delay: '0.25s', dur: '2.5s' },
            { size: 100, left: '-5%',  delay: '0.4s',  dur: '3.1s' },
            { size: 85,  left: '75%',  delay: '0.1s',  dur: '2.9s' },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              bottom: 20,
              left: c.left,
              width:  c.size,
              height: c.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(134,239,172,0.70) 0%, rgba(74,222,128,0.35) 55%, transparent 80%)`,
              animation: `mega-fart-smoke ${c.dur} ${c.delay} ease-out forwards`,
              filter: 'blur(6px)',
            }} />
          ))}

          {/* Emojis de gás */}
          {['💨','🤢','💚','☁️','💨'].map((e, i) => (
            <span key={i} style={{
              position: 'absolute',
              bottom: 40 + i * 12,
              left:   `${10 + i * 20}%`,
              fontSize: 20 + i * 4,
              animation: `mega-fart-emoji ${2.5 + i * 0.2}s ${i * 0.15}s ease-out forwards`,
              pointerEvents: 'none',
            }}>
              {e}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          filter: `drop-shadow(0 8px 20px ${shadowColor}) ${stageGlow}`,
          animation,
          display: 'inline-block',
          transition: 'filter 0.3s ease',
        }}
      >
        <svg
          width={140 * stageCfg.scale}
          height={160 * stageCfg.scale}
          viewBox="0 0 120 140"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transition: 'width 0.6s ease, height 0.6s ease' }}
        >
          <ellipse cx="60" cy="135" rx="38" ry="6" fill="rgba(0,0,0,0.08)" />

          <path
            d="M 60 10 C 95 10, 108 32, 107 62 C 106 92, 92 118, 60 122 C 28 118, 14 92, 13 62 C 12 32, 25 10, 60 10 Z"
            fill={bodyColor}
            style={{ transition: 'fill 0.6s ease' }}
          />

          <ellipse cx="40" cy="32" rx="13" ry="8"
            fill="rgba(255,255,255,0.40)"
            transform="rotate(-20 40 32)"
          />

          <circle cx="26" cy="72" r="9"
            fill={squeezed ? 'rgba(255,100,140,0.50)' : 'rgba(255,150,170,0.30)'}
            style={{ transition: 'fill 0.1s' }}
          />
          <circle cx="94" cy="72" r="9"
            fill={squeezed ? 'rgba(255,100,140,0.50)' : 'rgba(255,150,170,0.30)'}
            style={{ transition: 'fill 0.1s' }}
          />

          {/* ── Acessórios de evolução ── */}
          {stage === 'teen' && (
            // Estrela brilhante no topo da cabeça
            <g style={{ animation: 'bub-spark 2s ease-in-out infinite' }}>
              <polygon
                points="60,2 62.4,8.5 69,8.5 63.8,12.5 65.8,19 60,15 54.2,19 56.2,12.5 51,8.5 57.6,8.5"
                fill="#fbbf24"
                opacity="0.92"
              />
            </g>
          )}
          {stage === 'adult' && (
            // Coroa SVG discreta no topo
            <g>
              <path
                d="M44,10 L44,18 L52,13 L60,20 L68,13 L76,18 L76,10 Z"
                fill="#fbbf24"
                opacity="0.95"
              />
              {/* Pontas da coroa */}
              <circle cx="44" cy="10" r="2.5" fill="#fde68a" />
              <circle cx="60" cy="7"  r="2.5" fill="#fde68a" />
              <circle cx="76" cy="10" r="2.5" fill="#fde68a" />
              {/* Detalhes internos */}
              <rect x="47" y="14" width="26" height="5" rx="1" fill="#f59e0b" opacity="0.6" />
            </g>
          )}

          <Eyes state={state} squeezed={squeezed} hungry={hungry && state === 'idle'} />
          <Mouth state={state} squeezed={squeezed} />

          {/* Drool — só quando faminto e idle */}
          {hungry && state === 'idle' && (
            <g style={{ animation: 'drool-drop 1.6s ease-in-out infinite' }}>
              <ellipse cx="57" cy="90" rx="2.8" ry="2.2" fill="rgba(147,197,253,0.85)" />
              <ellipse cx="57" cy="95" rx="2.2" ry="3.5" fill="rgba(147,197,253,0.75)" />
            </g>
          )}

          {state === 'celebrating' && (
            <>
              <circle cx="20" cy="25" r="4" fill="#fbbf24" style={{ animation: 'bub-spark 0.8s ease-out infinite' }} />
              <circle cx="100" cy="20" r="3" fill="#a78bfa" style={{ animation: 'bub-spark 0.8s 0.15s ease-out infinite' }} />
              <circle cx="110" cy="55" r="5" fill="#fb7185" style={{ animation: 'bub-spark 0.8s 0.3s ease-out infinite' }} />
              <circle cx="12" cy="60" r="3.5" fill="#34d399" style={{ animation: 'bub-spark 0.8s 0.45s ease-out infinite' }} />
            </>
          )}

          {/* ZZZ quando dormindo */}
          {state === 'sleeping' && (
            <>
              <text x="92" y="38" fontSize="14" fontWeight="900" fill="rgba(196,181,253,0.85)"
                style={{ animation: 'bub-zzz1 3s ease-in-out infinite' }}>Z</text>
              <text x="102" y="22" fontSize="10" fontWeight="900" fill="rgba(196,181,253,0.65)"
                style={{ animation: 'bub-zzz2 3s 0.8s ease-in-out infinite' }}>z</text>
              <text x="110" y="10" fontSize="7" fontWeight="900" fill="rgba(196,181,253,0.45)"
                style={{ animation: 'bub-zzz3 3s 1.6s ease-in-out infinite' }}>z</text>
            </>
          )}

          {/* Lágrima extra quando muito triste */}
          {state === 'sad' && (
            <ellipse cx="80" cy="67" rx="3" ry="4" fill="rgba(147,197,253,0.80)" />
          )}
        </svg>
      </div>
    </div>
  )
}
