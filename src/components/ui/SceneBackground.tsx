// Fundo do mundo do Bububu — modo Pro (noite) ou Kids (dia / mar / doces)
import { useState, useEffect } from 'react'
import type { KidsWorldId } from '@/hooks/useKidsWorld'

const STARS = [
  { x:  5, y:  7, r: 1.5, dur: 2.1, delay: 0.0 },
  { x: 14, y:  3, r: 1.0, dur: 3.2, delay: 0.5 },
  { x: 24, y: 11, r: 2.0, dur: 2.8, delay: 1.1 },
  { x: 37, y:  5, r: 1.2, dur: 2.5, delay: 0.3 },
  { x: 51, y:  9, r: 1.8, dur: 3.5, delay: 0.8 },
  { x: 64, y:  4, r: 1.0, dur: 2.2, delay: 1.4 },
  { x: 77, y:  8, r: 1.5, dur: 2.9, delay: 0.2 },
  { x: 87, y:  5, r: 1.2, dur: 3.1, delay: 0.7 },
  { x: 94, y: 13, r: 1.8, dur: 2.4, delay: 1.2 },
  { x:  9, y: 21, r: 1.0, dur: 3.8, delay: 0.4 },
  { x: 44, y: 17, r: 1.5, dur: 2.6, delay: 0.9 },
  { x: 71, y: 19, r: 1.2, dur: 3.3, delay: 1.5 },
  { x: 91, y: 24, r: 1.0, dur: 2.7, delay: 0.1 },
  { x: 29, y: 27, r: 1.8, dur: 3.0, delay: 0.6 },
  { x: 59, y: 29, r: 1.3, dur: 2.3, delay: 1.0 },
  { x: 81, y: 34, r: 1.0, dur: 3.6, delay: 1.3 },
  { x: 17, y: 37, r: 1.5, dur: 2.0, delay: 0.8 },
  { x: 49, y: 41, r: 1.2, dur: 3.4, delay: 0.3 },
  { x:  7, y: 47, r: 1.0, dur: 2.8, delay: 1.1 },
  { x: 93, y: 44, r: 1.5, dur: 3.2, delay: 0.5 },
  { x: 33, y: 44, r: 1.0, dur: 2.6, delay: 0.7 },
  { x: 68, y: 49, r: 1.3, dur: 3.0, delay: 1.2 },
]

function CloudBlob({
  top, left, right, scale = 1, opacity = 0.14, dur = 12, delay = 0, color = 'white',
}: {
  top: string; left?: string; right?: string
  scale?: number; opacity?: number; dur?: number; delay?: number; color?: string
}) {
  return (
    <svg
      width={120 * scale} height={50 * scale}
      viewBox="0 0 120 50"
      style={{
        position: 'absolute',
        top, left, right,
        pointerEvents: 'none',
        animation: `cloud-drift ${dur}s ${delay}s ease-in-out infinite`,
      }}
    >
      <ellipse cx="60" cy="34" rx="50" ry="16" fill={`rgba(${color === 'white' ? '255,255,255' : color},${opacity})`} />
      <ellipse cx="38" cy="28" rx="28" ry="15" fill={`rgba(${color === 'white' ? '255,255,255' : color},${opacity})`} />
      <ellipse cx="82" cy="26" rx="24" ry="13" fill={`rgba(${color === 'white' ? '255,255,255' : color},${opacity})`} />
      <ellipse cx="60" cy="22" rx="32" ry="13" fill={`rgba(${color === 'white' ? '255,255,255' : color},${opacity})`} />
    </svg>
  )
}

// ── Mundo 1 (Kids): jardim ensolarado ─────────────────────────────────────────
function KidsBackground1() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>

      {/* Sol */}
      <div style={{
        position: 'absolute', top: '4%', right: '10%',
        width: 52, height: 52, borderRadius: '50%',
        background: 'radial-gradient(circle, #FFE135 30%, #FFAD00 100%)',
        boxShadow: '0 0 32px rgba(255,200,0,0.55)',
        animation: 'cloud-drift 12s ease-in-out infinite',
      }} />

      {/* Raios do sol */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 'calc(4% + 20px)', right: 'calc(10% + 20px)',
          width: 2, height: 14,
          background: '#FFD700',
          borderRadius: 99,
          opacity: 0.7,
          transformOrigin: '1px -10px',
          transform: `rotate(${deg}deg) translateY(-32px)`,
          animation: `cloud-drift ${10 + i}s ${i * 0.3}s ease-in-out infinite`,
        }} />
      ))}

      {/* Arco-íris */}
      <svg
        width="260" height="140"
        viewBox="0 0 260 140"
        style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', opacity: 0.18 }}
      >
        {[
          { r: 130, color: '#FF6B6B', w: 10 },
          { r: 116, color: '#FF9F43', w: 9  },
          { r: 103, color: '#FFD93D', w: 9  },
          { r:  90, color: '#6BCB77', w: 8  },
          { r:  78, color: '#4D96FF', w: 8  },
          { r:  66, color: '#C77DFF', w: 7  },
        ].map((arc, i) => (
          <path
            key={i}
            d={`M ${130 - arc.r},130 A ${arc.r},${arc.r} 0 0,1 ${130 + arc.r},130`}
            fill="none"
            stroke={arc.color}
            strokeWidth={arc.w}
          />
        ))}
      </svg>

      {/* Nuvens brancas e fofas */}
      <CloudBlob top="8%"  left="-2%"  opacity={0.70} dur={13} delay={0}   scale={1.1} />
      <CloudBlob top="5%"  right="-4%" opacity={0.60} dur={17} delay={4}   scale={0.90} />
      <CloudBlob top="22%" left="12%"  opacity={0.50} dur={20} delay={8}   scale={0.75} />
      <CloudBlob top="16%" right="15%" opacity={0.45} dur={15} delay={6}   scale={0.65} />

      {/* Bolinhas candy flutuantes */}
      {[
        { top: '12%', left: '5%',  size: 10, color: '#FF6B6B', dur: 8 },
        { top: '20%', left: '82%', size: 8,  color: '#FFD93D', dur: 10 },
        { top: '30%', left: '15%', size: 6,  color: '#6BCB77', dur: 9  },
        { top: '8%',  left: '55%', size: 9,  color: '#C77DFF', dur: 11 },
        { top: '25%', left: '70%', size: 7,  color: '#4D96FF', dur: 7  },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: b.top, left: b.left,
          width: b.size, height: b.size, borderRadius: '50%',
          background: b.color, opacity: 0.55,
          boxShadow: `0 0 ${b.size}px ${b.color}`,
          animation: `cloud-drift ${b.dur}s ${i * 1.3}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

// ── Mundo 2 (Kids): fundo do mar ──────────────────────────────────────────────
function KidsBackground2() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>

      {/* Raios de luz vindos de cima */}
      {[15, 35, 55, 72, 88].map((x, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0,
          left: `${x}%`,
          width: 22 + i * 6,
          height: '55%',
          background: `linear-gradient(to bottom, rgba(100,220,255,${0.10 - i * 0.01}) 0%, transparent 100%)`,
          transform: `rotate(${-5 + i * 3}deg)`,
          transformOrigin: 'top center',
          animation: `cloud-drift ${7 + i * 2}s ${i * 0.8}s ease-in-out infinite`,
        }} />
      ))}

      {/* Bolhas subindo */}
      {[8, 22, 40, 58, 73, 85, 92].map((x, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: `${10 + (i * 13) % 55}%`,
          left: `${x}%`,
          width: 6 + (i % 3) * 4,
          height: 6 + (i % 3) * 4,
          borderRadius: '50%',
          border: '1.5px solid rgba(150,240,255,0.60)',
          background: 'rgba(150,240,255,0.12)',
          animation: `bubble-rise ${5 + i * 1.4}s ${i * 0.7}s ease-in infinite`,
        }} />
      ))}

      {/* Peixe 1 — nada para a esquerda */}
      <svg width="60" height="30" viewBox="0 0 60 30"
        style={{
          position: 'absolute', top: '18%', left: 0,
          opacity: 0.70,
          animation: 'fish-swim-left 18s 2s linear infinite',
        }}>
        <ellipse cx="28" cy="15" rx="18" ry="8" fill="#FF6B6B" />
        <polygon points="46,15 60,5 60,25" fill="#FF6B6B" />
        <circle cx="18" cy="12" r="2.5" fill="white" />
        <circle cx="18" cy="12" r="1.2" fill="#222" />
        <path d="M22 17 Q25 20 28 17" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
      </svg>

      {/* Peixe 2 — nada para a direita */}
      <svg width="50" height="25" viewBox="0 0 60 30"
        style={{
          position: 'absolute', top: '35%', right: 0,
          opacity: 0.65,
          transform: 'scaleX(-1)',
          animation: 'fish-swim-right 22s 8s linear infinite',
        }}>
        <ellipse cx="28" cy="15" rx="18" ry="8" fill="#FFD93D" />
        <polygon points="46,15 60,5 60,25" fill="#FFD93D" />
        <circle cx="18" cy="12" r="2.5" fill="white" />
        <circle cx="18" cy="12" r="1.2" fill="#222" />
        <path d="M22 17 Q25 20 28 17" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
      </svg>

      {/* Corais e algas no fundo */}
      <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: '2%', left: 0 }}>
        {/* Coral 1 */}
        <ellipse cx="40"  cy="60" rx="6"  ry="20" fill="rgba(255,100,100,0.55)" />
        <ellipse cx="32"  cy="55" rx="5"  ry="16" fill="rgba(255,100,100,0.45)" />
        <ellipse cx="48"  cy="58" rx="5"  ry="14" fill="rgba(255,140,100,0.45)" />
        {/* Algas */}
        <path d="M80 80 Q85 60 78 45 Q83 30 80 15" stroke="rgba(60,200,120,0.65)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M90 80 Q94 55 88 40 Q93 25 90 10" stroke="rgba(80,220,140,0.55)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Coral 2 */}
        <ellipse cx="160" cy="62" rx="5"  ry="18" fill="rgba(200,100,220,0.55)" />
        <ellipse cx="152" cy="58" rx="4"  ry="13" fill="rgba(200,100,220,0.45)" />
        <ellipse cx="168" cy="60" rx="4"  ry="15" fill="rgba(180,80,200,0.45)" />
        {/* Algas 2 */}
        <path d="M220 80 Q226 58 218 43 Q224 28 220 12" stroke="rgba(60,200,120,0.60)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Coral 3 */}
        <ellipse cx="290" cy="61" rx="6"  ry="19" fill="rgba(100,180,255,0.55)" />
        <ellipse cx="282" cy="56" rx="5"  ry="14" fill="rgba(100,180,255,0.45)" />
        <ellipse cx="298" cy="59" rx="5"  ry="16" fill="rgba(80,160,235,0.45)" />
        {/* Algas 3 */}
        <path d="M340 80 Q346 60 338 44 Q344 28 340 14" stroke="rgba(70,210,130,0.55)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M355 80 Q360 55 353 40 Q359 24 355 10" stroke="rgba(60,200,120,0.50)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Areia */}
        <ellipse cx="200" cy="78" rx="200" ry="8" fill="rgba(255,220,100,0.18)" />
      </svg>

      {/* Estrela do mar */}
      <div style={{
        position: 'absolute', bottom: '8%', right: '12%',
        fontSize: 22, opacity: 0.65,
        animation: 'cloud-drift 9s 3s ease-in-out infinite',
      }}>⭐</div>
    </div>
  )
}

// ── Mundo 3 (Kids): terra dos doces ──────────────────────────────────────────
function KidsBackground3() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>

      {/* Estrelinhas brilhantes */}
      {[
        { top: '6%',  left: '8%',  size: 14, delay: 0   },
        { top: '3%',  left: '38%', size: 12, delay: 0.6 },
        { top: '9%',  left: '62%', size: 16, delay: 1.2 },
        { top: '5%',  left: '80%', size: 11, delay: 0.3 },
        { top: '15%', left: '22%', size: 10, delay: 1.8 },
        { top: '20%', left: '74%', size: 13, delay: 0.9 },
        { top: '28%', left: '50%', size: 9,  delay: 1.5 },
        { top: '32%', left: '88%', size: 11, delay: 0.4 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          fontSize: s.size,
          animation: `star-twinkle ${2 + (i % 3) * 0.7}s ${s.delay}s ease-in-out infinite`,
        }}>✨</div>
      ))}

      {/* Nuvens de algodão doce */}
      <CloudBlob top="6%"  left="-2%"  opacity={0.75} dur={14} delay={0}   scale={1.1} color="255,182,193" />
      <CloudBlob top="4%"  right="-3%" opacity={0.65} dur={18} delay={5}   scale={0.90} color="221,160,221" />
      <CloudBlob top="20%" left="10%"  opacity={0.50} dur={21} delay={9}   scale={0.80} color="255,182,193" />
      <CloudBlob top="14%" right="14%" opacity={0.48} dur={16} delay={7}   scale={0.70} color="176,224,230" />

      {/* Pirulito esquerdo */}
      <svg width="36" height="110" viewBox="0 0 36 110"
        style={{ position: 'absolute', bottom: '3%', left: '6%', opacity: 0.80 }}>
        {/* Cabo */}
        <line x1="18" y1="38" x2="18" y2="110" stroke="#e0c0f0" strokeWidth="4" strokeLinecap="round" />
        {/* Bola */}
        <circle cx="18" cy="22" r="18" fill="#FF6EB4" />
        <path d="M0 22 A18 18 0 0 1 36 22" fill="#FF9ED4" />
        <circle cx="18" cy="22" r="6" fill="rgba(255,255,255,0.30)" />
        {/* Espiral */}
        <path d="M10 14 Q18 8 26 14 Q32 20 26 28 Q18 34 10 28 Q4 20 10 14"
          stroke="white" strokeWidth="2.5" fill="none" opacity="0.40" strokeLinecap="round" />
      </svg>

      {/* Pirulito direito */}
      <svg width="30" height="90" viewBox="0 0 30 90"
        style={{ position: 'absolute', bottom: '4%', right: '8%', opacity: 0.75 }}>
        <line x1="15" y1="30" x2="15" y2="90" stroke="#d0b0e8" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="15" cy="18" r="15" fill="#A78BFA" />
        <path d="M0 18 A15 15 0 0 1 30 18" fill="#C4B5FD" />
        <circle cx="15" cy="18" r="5" fill="rgba(255,255,255,0.30)" />
        <path d="M8 11 Q15 6 22 11 Q26 16 22 23 Q15 28 8 23 Q4 16 8 11"
          stroke="white" strokeWidth="2" fill="none" opacity="0.40" strokeLinecap="round" />
      </svg>

      {/* Pirulito pequeno (centro-esquerda) */}
      <svg width="22" height="65" viewBox="0 0 22 65"
        style={{ position: 'absolute', bottom: '5%', left: '35%', opacity: 0.65 }}>
        <line x1="11" y1="22" x2="11" y2="65" stroke="#fbb6ce" strokeWidth="3" strokeLinecap="round" />
        <circle cx="11" cy="13" r="11" fill="#F472B6" />
        <path d="M0 13 A11 11 0 0 1 22 13" fill="#FBCFE8" />
        <circle cx="11" cy="13" r="3.5" fill="rgba(255,255,255,0.30)" />
      </svg>

      {/* Gominhas flutuantes */}
      {[
        { top: '10%', left: '18%', emoji: '🍬', size: 18, dur: 8  },
        { top: '22%', left: '82%', emoji: '🍫', size: 16, dur: 11 },
        { top: '14%', left: '55%', emoji: '🍭', size: 20, dur: 9  },
        { top: '30%', left: '30%', emoji: '🍡', size: 15, dur: 10 },
        { top: '35%', left: '68%', emoji: '🧁', size: 17, dur: 12 },
      ].map((g, i) => (
        <div key={i} style={{
          position: 'absolute', top: g.top, left: g.left,
          fontSize: g.size, opacity: 0.65,
          animation: `cloud-drift ${g.dur}s ${i * 1.5}s ease-in-out infinite`,
        }}>{g.emoji}</div>
      ))}
    </div>
  )
}

// ── Fundo Pro: noite cósmica ───────────────────────────────────────────────────
function ProBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      <svg width="100%" height="55%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
            style={{ animation: `star-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
        ))}
      </svg>
      <CloudBlob top="4%"  left="-3%"  opacity={0.14} dur={13} delay={0} />
      <CloudBlob top="10%" right="-5%" opacity={0.10} dur={17} delay={4} scale={0.85} />
      <CloudBlob top="26%" left="8%"   opacity={0.07} dur={20} delay={8} scale={0.70} />
      <div style={{
        position: 'absolute', top: '14%', left: '6%', width: 90, height: 90, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,132,252,0.28) 0%, transparent 70%)',
        animation: 'cloud-drift 11s 1s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '18%', right: '5%', width: 65, height: 65, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)',
        animation: 'cloud-drift 14s 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '38%', left: '50%', width: 120, height: 120, borderRadius: '50%',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
        animation: 'cloud-drift 16s 3s ease-in-out infinite',
      }} />
    </div>
  )
}

// ── Easter egg: Maria fumaça de São Sebastião do Rio Verde ────────────────────
function TinyTrain() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>

    function schedule(delay: number) {
      t = setTimeout(() => {
        setVisible(true)
        setTimeout(() => setVisible(false), 14000)
        schedule(Math.round((9 + Math.random() * 6) * 60_000))
      }, delay)
    }

    schedule(30_000) // primeira aparição em 30s; depois ~10 min
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes train-cross {
          from { transform: translateX(100vw); }
          to   { transform: translateX(-220px); }
        }
        @keyframes smoke-puff {
          0%   { opacity: 0.55; transform: translateY(0px) scale(1); }
          100% { opacity: 0;    transform: translateY(-32px) scale(2.4); }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        bottom: '6%',
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.52,
        animation: 'train-cross 14s linear forwards',
      }}>
        {/* Trilho */}
        <svg width="220" height="4" viewBox="0 0 220 4" style={{ display: 'block', marginBottom: -2 }}>
          <line x1="0" y1="2" x2="220" y2="2" stroke="rgba(196,181,253,0.22)" strokeWidth="2" strokeDasharray="8 6" />
        </svg>

        {/* Trem SVG */}
        <svg width="210" height="68" viewBox="0 0 210 68">
          {/* Fumaça saindo da chaminé */}
          {[0, 1, 2].map(i => (
            <circle
              key={i}
              cx={22} cy={6 - i * 3}
              r={3 + i * 2.5}
              fill="rgba(196,181,253,0.45)"
              style={{ animation: `smoke-puff 2.2s ${i * 0.75}s ease-out infinite` }}
            />
          ))}

          {/* ─── Locomotiva ─── */}
          <rect x="14" y="12" width="11" height="20" rx="2" fill="#5b21b6" />
          <rect x="10" y="10" width="19" height="5" rx="2" fill="#4c1d95" />
          <ellipse cx="44" cy="35" rx="26" ry="14" fill="#7c3aed" />
          <ellipse cx="52" cy="23" rx="8" ry="6" fill="#6d28d9" />
          <rect x="58" y="17" width="22" height="34" rx="3" fill="#6d28d9" />
          <rect x="62" y="21" width="14" height="10" rx="2" fill="#ddd6fe" opacity="0.55" />
          <polygon points="6,46 18,40 18,52" fill="#4c1d95" />
          <circle cx="5"  cy="41" r="4"  fill="#fde68a" opacity="0.9" />
          <circle cx="5"  cy="41" r="7"  fill="rgba(253,230,138,0.18)" />
          <circle cx="38" cy="55" r="12" fill="none" stroke="#4c1d95" strokeWidth="2.5" />
          <circle cx="38" cy="55" r="7"  fill="#5b21b6" />
          <circle cx="38" cy="55" r="2.5" fill="#c4b5fd" />
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <line
              key={i}
              x1={38} y1={55}
              x2={38 + 9 * Math.cos((deg * Math.PI) / 180)}
              y2={55 + 9 * Math.sin((deg * Math.PI) / 180)}
              stroke="#4c1d95" strokeWidth="1.2"
            />
          ))}
          <circle cx="14" cy="57" r="8" fill="none" stroke="#4c1d95" strokeWidth="2" />
          <circle cx="14" cy="57" r="4" fill="#5b21b6" />
          <circle cx="62" cy="57" r="8" fill="none" stroke="#4c1d95" strokeWidth="2" />
          <circle cx="62" cy="57" r="4" fill="#5b21b6" />
          <line x1="14" y1="55" x2="62" y2="55" stroke="#4c1d95" strokeWidth="1.5" opacity="0.6" />
          <path d="M30,22 Q30,16 36,16" stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* ─── Engate ─── */}
          <line x1="80" y1="45" x2="88" y2="45" stroke="#4c1d95" strokeWidth="2" />

          {/* ─── Vagão de passageiros ─── */}
          <rect x="88" y="24" width="72" height="30" rx="4" fill="#6d28d9" />
          <rect x="90" y="22" width="68" height="4" rx="2" fill="#5b21b6" />
          {[94, 111, 128, 145].map(x => (
            <rect key={x} x={x} y={30} width="11" height="10" rx="2" fill="#ddd6fe" opacity="0.42" />
          ))}
          <circle cx="104" cy="57" r="8" fill="none" stroke="#4c1d95" strokeWidth="2" />
          <circle cx="104" cy="57" r="4" fill="#5b21b6" />
          <circle cx="148" cy="57" r="8" fill="none" stroke="#4c1d95" strokeWidth="2" />
          <circle cx="148" cy="57" r="4" fill="#5b21b6" />

          {/* ─── Segundo vagão ─── */}
          <line x1="160" y1="45" x2="168" y2="45" stroke="#4c1d95" strokeWidth="2" />
          <rect x="168" y="26" width="38" height="28" rx="4" fill="#5b21b6" />
          <rect x="170" y="24" width="34" height="4" rx="2" fill="#4c1d95" />
          <rect x="173" y="32" width="11" height="9" rx="2" fill="#ddd6fe" opacity="0.38" />
          <rect x="188" y="32" width="11" height="9" rx="2" fill="#ddd6fe" opacity="0.38" />
          <circle cx="180" cy="57" r="7" fill="none" stroke="#4c1d95" strokeWidth="2" />
          <circle cx="180" cy="57" r="3.5" fill="#4c1d95" />
          <circle cx="198" cy="57" r="7" fill="none" stroke="#4c1d95" strokeWidth="2" />
          <circle cx="198" cy="57" r="3.5" fill="#4c1d95" />
        </svg>
      </div>
    </>
  )
}

export function SceneBackground({ isKids = false, worldId = 1 }: { isKids?: boolean; worldId?: KidsWorldId }) {
  function renderKidsWorld() {
    if (worldId === 3) return <KidsBackground3 />
    if (worldId === 2) return <KidsBackground2 />
    return <KidsBackground1 />
  }

  return (
    <>
      {isKids ? renderKidsWorld() : <ProBackground />}
      {/* Overlay do trem: clampado ao céu — nunca invade result zone ou chips */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '52%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <TinyTrain />
      </div>
    </>
  )
}
