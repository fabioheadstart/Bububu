import { useState, useCallback, useRef } from 'react'
import type { RewardTier } from '@/types'

export type BubState = 'idle' | 'eating' | 'celebrating' | 'sleeping' | 'sad' | 'yawning'
type TapReaction  = 'squish' | 'jiggle' | 'bounce' | 'spin'

const TAP_REACTIONS: TapReaction[] = ['squish', 'jiggle', 'bounce', 'spin']
const TAP_PARTICLES = ['⭐', '💜', '✨', '💫', '🌟', '💕']

// Easter egg: 10 taps = mega fart
const MEGA_FART_THRESHOLD = 10
const TAP_WINDOW_MS       = 12_000  // janela de 12 segundos

interface Particle { id: number; emoji: string; x: number; y: number }

interface Props {
  state: BubState
  rewardTier?: RewardTier
  onTap?: () => void
  onMegaFart?: () => void   // callback para tocar sons na FeedScreen
  hungry?: boolean
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
        <circle cx="44" cy="50" r="9" fill="#1a1a2e" />
        <circle cx="76" cy="50" r="9" fill="#1a1a2e" />
        <circle cx="41" cy="50" r="3" fill="white" />
        <circle cx="73" cy="50" r="3" fill="white" />
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

export function BububuCharacter({ state, rewardTier, onTap, onMegaFart, hungry }: Props) {
  const [tapReaction, setTapReaction]   = useState<TapReaction | null>(null)
  const [particles, setParticles]       = useState<Particle[]>([])
  const [megaFart, setMegaFart]         = useState(false)
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
    return '#c4b5fd'
  })()

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
          filter: `drop-shadow(0 8px 20px ${shadowColor})`,
          animation,
          display: 'inline-block',
          transition: 'filter 0.3s ease',
        }}
      >
        <svg width="140" height="160" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
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

          <Eyes state={state} squeezed={squeezed} hungry={hungry && state === 'idle'} />
          <Mouth state={state} squeezed={squeezed} />

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
