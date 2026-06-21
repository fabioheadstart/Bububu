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
        <line x1="11" y1="22" x2="11" y2="65" stroke="#fbb6ce" strokeWidth="3" strokeLinecap="r