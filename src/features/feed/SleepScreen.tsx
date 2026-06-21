import { useState } from 'react'
import { playGroggyBububu } from '@/lib/audio/sounds'
import type { AppMode } from '@/types'

interface Props {
  mode:         AppMode
  onModeChange: (m: AppMode) => void
  onWake?:      () => void
}

export function SleepScreen({ mode, onModeChange, onWake }: Props) {
  const [showSwitch, setShowSwitch] = useState(false)
  const [waking,     setWaking]     = useState(false)   // animação de acordar

  const wakeHour   = 7
  const sleepStart = mode === 'kids' ? 20 : 22
  const hour       = new Date().getHours()
  const isEarlyMorning = hour < wakeHour

  const message = isEarlyMorning
    ? `Bububu acorda às ${wakeHour}h ☀️`
    : `Bububu dorme às ${sleepStart}h 🌙`

  function handleWake() {
    playGroggyBububu()
    setWaking(true)
    onWake?.()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1,
      background: 'linear-gradient(170deg, #0f0825 0%, #1a0f3d 50%, #0d1b2a 100%)',
      padding: '40px 24px',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ⚙️ */}
      <button
        onClick={() => setShowSwitch(s => !s)}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(196,181,253,0.25)',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          color: 'rgba(196,181,253,0.55)',
          fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
        }}
      >⚙️</button>

      {/* Painel modo */}
      {showSwitch && (
        <div style={{
          position: 'absolute', top: 58, right: 16,
          background: 'rgba(30,8,70,0.95)',
          border: '1px solid rgba(167,139,250,0.25)',
          borderRadius: 16, padding: '16px 18px',
          zIndex: 20, minWidth: 190,
          animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.45)', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            MODO DE USO
          </div>
          {([
            { m: 'kids', label: '🌱 Kids', sub: '6 a 12 anos' },
            { m: 'pro',  label: '⚡ Pro',  sub: '13 anos ou mais' },
          ] as { m: AppMode; label: string; sub: string }[]).map(({ m, label, sub }) => (
            <button
              key={m}
              onClick={() => { onModeChange(m); setShowSwitch(false) }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                width: '100%',
                background: mode === m ? 'rgba(124,58,237,0.35)' : 'transparent',
                border: mode === m ? '1px solid rgba(167,139,250,0.40)' : '1px solid transparent',
                borderRadius: 10, padding: '10px 12px',
                cursor: 'pointer', marginBottom: 6, transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: '#e9d5ff' }}>{label}</span>
              <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.50)', marginTop: 2 }}>{sub}</span>
            </button>
          ))}
        </div>
      )}

      {/* Estrelas */}
      {[
        { top: '8%',  left: '15%', s: 3, o: 0.7 },
        { top: '12%', left: '75%', s: 2, o: 0.5 },
        { top: '20%', left: '45%', s: 4, o: 0.4 },
        { top: '6%',  left: '55%', s: 2, o: 0.6 },
        { top: '25%', left: '85%', s: 3, o: 0.5 },
        { top: '15%', left: '30%', s: 2, o: 0.4 },
        { top: '30%', left: '10%', s: 2, o: 0.5 },
        { top: '35%', left: '60%', s: 3, o: 0.3 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.s, height: s.s, borderRadius: '50%',
          background: `rgba(255,255,255,${s.o})`,
          boxShadow: `0 0 ${s.s * 2}px rgba(255,255,255,${s.o})`,
          animation: `star-twinkle ${2.5 + i * 0.4}s ease-in-out infinite`,
        }} />
      ))}

      {/* Lua */}
      <div style={{ position: 'absolute', top: '6%', right: '12%', width: 48, height: 48 }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#fde68a" opacity="0.9" />
          <circle cx="32" cy="16" r="18" fill="#0f0825" />
        </svg>
      </div>

      {/* Bububu — dormindo ou acordando */}
      <div style={{
        position: 'relative',
        animation: waking
          ? 'bub-celebrate 0.6s ease-in-out'
          : 'bub-float 4s ease-in-out infinite',
        marginBottom: 8,
      }}>
        {waking ? (
          /* ── CARA DE SONO: olhos meio fechados, bocejando ── */
          <svg width="140" height="160" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="135" rx="38" ry="6" fill="rgba(0,0,0,0.15)" />
            {/* Corpo */}
            <path
              d="M 60 10 C 95 10, 108 32, 107 62 C 106 92, 92 118, 60 122 C 28 118, 14 92, 13 62 C 12 32, 25 10, 60 10 Z"
              fill="#8b5cf6"
            />
            <ellipse cx="40" cy="32" rx="13" ry="8" fill="rgba(255,255,255,0.20)" transform="rotate(-20 40 32)" />
            {/* Bochechas coradas */}
            <circle cx="26" cy="72" r="9" fill="rgba(255,150,170,0.30)" />
            <circle cx="94" cy="72" r="9" fill="rgba(255,150,170,0.30)" />
            {/* Olho esquerdo: meio fechado = arco + pálpebra */}
            <ellipse cx="44" cy="54" rx="10" ry="7" fill="white" opacity="0.9"/>
            <ellipse cx="44" cy="54" rx="6"  ry="4" fill="#1a1a2e"/>
            {/* pálpebra caída */}
            <path d="M 34 50 Q 44 46 54 50" stroke="#1a1a2e" strokeWidth="3.5" fill="#8b5cf6" strokeLinecap="round"/>
            {/* Olho direito */}
            <ellipse cx="76" cy="54" rx="10" ry="7" fill="white" opacity="0.9"/>
            <ellipse cx="76" cy="54" rx="6"  ry="4" fill="#1a1a2e"/>
            <path d="M 66 50 Q 76 46 86 50" stroke="#1a1a2e" strokeWidth="3.5" fill="#8b5cf6" strokeLinecap="round"/>
            {/* Boca bocejando: oval aberta */}
            <ellipse cx="60" cy="84" rx="12" ry="10" fill="#1a1a2e" opacity="0.85"/>
            <ellipse cx="60" cy="87" rx="8"  ry="6"  fill="#7c3aed" opacity="0.6"/>
            <ellipse cx="60" cy="130" rx="32" ry="10" fill="rgba(196,181,253,0.25)" />
          </svg>
        ) : (
          /* ── DORMINDO: olhos fechados, Zzzz ── */
          <svg width="140" height="160" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="135" rx="38" ry="6" fill="rgba(0,0,0,0.15)" />
            <path
              d="M 60 10 C 95 10, 108 32, 107 62 C 106 92, 92 118, 60 122 C 28 118, 14 92, 13 62 C 12 32, 25 10, 60 10 Z"
              fill="#7c3aed" opacity="0.75"
            />
            <ellipse cx="40" cy="32" rx="13" ry="8" fill="rgba(255,255,255,0.20)" transform="rotate(-20 40 32)" />
            <circle cx="26" cy="72" r="9" fill="rgba(255,150,170,0.20)" />
            <circle cx="94" cy="72" r="9" fill="rgba(255,150,170,0.20)" />
            {/* Olhos fechados */}
            <path d="M 36 50 Q 44 56 52 50" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 68 50 Q 76 56 84 50" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Sorriso suave */}
            <path d="M 50 78 Q 60 83 70 78" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="60" cy="128" rx="32" ry="10" fill="rgba(196,181,253,0.25)" />
          </svg>
        )}

        {/* Zzz — só quando dormindo */}
        {!waking && ['Z', 'z', 'z'].map((z, i) => (
          <span key={i} style={{
            position: 'absolute',
            top:  `${20 - i * 22}%`,
            left: `${68 + i * 10}%`,
            fontSize: 18 - i * 4, fontWeight: 900,
            color: 'rgba(196,181,253,0.85)',
            animation: `zzz-float ${2 + i * 0.4}s ${i * 0.5}s ease-in-out infinite`,
          }}>{z}</span>
        ))}

        {/* Emoji acordando */}
        {waking && (
          <span style={{
            position: 'absolute', top: '-5%', left: '68%',
            fontSize: 28,
            animation: 'bub-spark 0.5s ease-out',
          }}>🥱</span>
        )}
      </div>

      {/* Texto */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'rgba(233,213,255,0.90)', marginBottom: 8 }}>
          {waking ? 'Acordando...' : 'Bububu está dormindo...'}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(196,181,253,0.60)', lineHeight: 1.6 }}>
          {waking ? 'Ele está com muito sono, mas vai jogar... 🥱' : message}
        </div>
        {!waking && (
          <div style={{ fontSize: 13, color: 'rgba(196,181,253,0.40)', marginTop: 8 }}>
            Ele precisa descansar para aprender mais! 💜
          </div>
        )}
      </div>

      {/* Botão acordar */}
      {onWake && !waking && (
        <button
          onClick={handleWake}
          style={{
            marginTop: 28,
            padding: '14px 32px', borderRadius: 16, outline: "none",
            background: 'rgba(124,58,237,0.25)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: 'rgba(233,213,255,0.80)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background 0.15s',
          } as React.CSSProperties}
        >
          Acordar ele 🥱
        </button>
      )}

      {showSwitch && (
        <div onClick={() => setShowSwitch(false)} style={{ position: 'fixed', inset: 0, zIndex: 5 }} />
      )}
    </div>
  )
}
