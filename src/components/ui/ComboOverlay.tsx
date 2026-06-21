import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'

export type ComboType = 'trio' | 'versus' | 'konami'

export interface ComboData {
  type: ComboType
  words: string[]
  category?: string   // para trio
}

interface Props {
  combo: ComboData | null
  onDone: () => void
}

const DURATION: Record<ComboType, number> = {
  trio:    2400,
  versus:  2000,
  konami:  4200,
}

export function ComboOverlay({ combo, onDone }: Props) {
  useEffect(() => {
    if (!combo) return
    const t = setTimeout(onDone, DURATION[combo.type])
    return () => clearTimeout(t)
  }, [combo, onDone])

  if (!combo) return null

  return createPortal(
    <>
      <style>{`
        @keyframes combo-bg-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes combo-slam {
          0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(2deg); opacity: 1; }
          80%  { transform: scale(0.96) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes vs-left {
          from { transform: translateX(-120px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes vs-right {
          from { transform: translateX(120px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes vs-center {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes lightning {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
        @keyframes konami-star {
          0%   { transform: translate(0,0) scale(0); opacity: 1; }
          100% { transform: translate(var(--sx), var(--sy)) scale(1.5); opacity: 0; }
        }
        @keyframes konami-text {
          0%   { letter-spacing: -0.5em; opacity: 0; transform: scale(0.5); }
          60%  { letter-spacing: 0.15em; opacity: 1; transform: scale(1.06); }
          100% { letter-spacing: 0.08em; transform: scale(1); }
        }
        @keyframes konami-sub {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes word-chip-in {
          from { transform: scale(0) rotate(-12deg); opacity: 0; }
          to   { transform: scale(1) rotate(0); opacity: 1; }
        }
      `}</style>

      <div
        onClick={onDone}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'combo-bg-in 0.18s ease',
        }}
      >
        {combo.type === 'trio'   && <TrioView   combo={combo} />}
        {combo.type === 'versus' && <VersusView combo={combo} />}
        {combo.type === 'konami' && <KonamiView combo={combo} />}
      </div>
    </>,
    document.body
  )
}

// ─── Trio ─────────────────────────────────────────────────────────────────────
function TrioView({ combo }: { combo: ComboData }) {
  const cat   = combo.category ?? ''
  const color = getCategoryColor(cat)
  const label = color.label || cat

  // Versão rgba mais escura do bg para o overlay
  const overlayBg = `radial-gradient(circle at 50% 40%, ${color.overlayFrom} 0%, rgba(10,4,30,0.92) 70%)`

  return (
    <div style={{
      background: overlayBg,
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 18,
    }}>
      {/* Label categoria */}
      <div style={{
        fontSize: 13, fontWeight: 900, letterSpacing: 4,
        textTransform: 'uppercase',
        color: `${color.ring}bb`,
        animation: 'konami-sub 0.3s 0.1s ease both',
      }}>
        {label} · 3 SEGUIDAS
      </div>

      {/* COMBO! */}
      <div style={{
        fontSize: 72, fontWeight: 900, color: color.ring,
        letterSpacing: -2, lineHeight: 1,
        textShadow: `0 0 40px ${color.glow}, 0 4px 0 rgba(0,0,0,0.6)`,
        animation: 'combo-slam 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        COMBO!
      </div>

      {/* As 3 palavras */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {combo.words.map((w, i) => (
          <div key={w} style={{
            background: `${color.bg}28`,
            border: `2px solid ${color.ring}66`,
            borderRadius: 12, padding: '10px 18px',
            fontSize: 20, fontWeight: 800, color: color.ring,
            animation: `word-chip-in 0.35s cubic-bezier(0.34,1.56,0.64,1) ${0.18 + i * 0.08}s both`,
          }}>
            {w}
          </div>
        ))}
      </div>

      {/* XP bonus */}
      <div style={{
        fontSize: 15, fontWeight: 800, color: color.ring,
        background: `${color.bg}20`,
        border: `1px solid ${color.ring}44`,
        borderRadius: 99, padding: '6px 20px',
        animation: 'konami-sub 0.3s 0.45s ease both',
      }}>
        ✨ +50 XP bônus
      </div>
    </div>
  )
}

// ─── VS ───────────────────────────────────────────────────────────────────────
function VersusView({ combo }: { combo: ComboData }) {
  const [w1, w2] = combo.words
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'stretch',
      overflow: 'hidden',
    }}>
      {/* Lado esquerdo */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(10,4,30,0.92) 100%)',
        animation: 'vs-left 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <span style={{
          fontSize: 44, fontWeight: 900, color: '#e9d5ff',
          textShadow: '0 0 24px rgba(167,139,250,0.8)',
          letterSpacing: -1,
        }}>
          {w1}
        </span>
      </div>

      {/* Centro VS */}
      <div style={{
        width: 100, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,4,30,0.96)',
        position: 'relative', zIndex: 1,
        animation: 'vs-center 0.35s 0.15s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%',
          width: 2, background: 'linear-gradient(to bottom, transparent, #a78bfa, transparent)',
          animation: 'lightning 0.4s ease-in-out infinite',
        }} />
        <div style={{
          fontSize: 32, fontWeight: 900, color: '#a78bfa',
          textShadow: '0 0 20px rgba(167,139,250,0.9)',
          position: 'relative', zIndex: 2,
          lineHeight: 1,
        }}>
          ⚡<br/>VS<br/>⚡
        </div>
      </div>

      {/* Lado direito */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(225deg, rgba(236,72,153,0.85) 0%, rgba(10,4,30,0.92) 100%)',
        animation: 'vs-right 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <span style={{
          fontSize: 44, fontWeight: 900, color: '#fce7f3',
          textShadow: '0 0 24px rgba(236,72,153,0.8)',
          letterSpacing: -1,
        }}>
          {w2}
        </span>
      </div>
    </div>
  )
}

// ─── Konami Ultra ─────────────────────────────────────────────────────────────
const STARS = ['⭐','✨','💫','🌟','⚡','💜','🫧']
const STAR_DATA = Array.from({ length: 24 }, (_, i) => ({
  emoji: STARS[i % STARS.length],
  sx: `${(Math.random() * 300 - 150).toFixed(0)}px`,
  sy: `${(Math.random() * 300 - 150).toFixed(0)}px`,
  delay: `${(Math.random() * 0.6).toFixed(2)}s`,
  size: 14 + Math.floor(Math.random() * 18),
}))

function KonamiView({ combo: _ }: { combo: ComboData }) {
  return (
    <div style={{
      background: 'radial-gradient(circle at 50% 45%, rgba(124,58,237,0.35) 0%, rgba(10,4,30,0.96) 65%)',
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      overflow: 'hidden',
    }}>
      {STAR_DATA.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          fontSize: s.size,
          ['--sx' as string]: s.sx,
          ['--sy' as string]: s.sy,
          animation: `konami-star 1.2s ${s.delay} ease-out both`,
          pointerEvents: 'none',
        } as React.CSSProperties}>
          {s.emoji}
        </div>
      ))}

      <div style={{
        fontSize: 14, fontWeight: 900, letterSpacing: 6,
        color: 'rgba(196,181,253,0.6)', textTransform: 'uppercase',
        animation: 'konami-sub 0.4s 0.1s ease both',
      }}>
        ☆ SEGREDO DESCOBERTO ☆
      </div>

      <div style={{
        fontSize: 58, fontWeight: 900, color: '#c084fc',
        lineHeight: 1.1, textAlign: 'center',
        textShadow: '0 0 60px rgba(192,132,252,0.7), 0 4px 0 rgba(76,29,149,0.9)',
        animation: 'konami-text 0.55s 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        ULTRA<br/>COMBO
      </div>

      <div style={{
        fontSize: 36, letterSpacing: 8,
        animation: 'konami-sub 0.4s 0.55s ease both',
      }}>
        🫧🫧🫧🫧🫧
      </div>

      <div style={{
        fontSize: 16, fontWeight: 800, color: '#c084fc',
        background: 'rgba(192,132,252,0.12)',
        border: '1px solid rgba(192,132,252,0.35)',
        borderRadius: 99, padding: '7px 24px',
        animation: 'konami-sub 0.4s 0.75s ease both',
      }}>
        💥 +200 XP
      </div>
    </div>
  )
}
