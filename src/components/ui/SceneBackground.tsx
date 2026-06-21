// Fundo do mundo do Bububu — modo Pro (noite) ou Kids (dia)

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

// ── Fundo Kids: dia ensolarado ─────────────────────────────────────────────────
function KidsBackground() {
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

export function SceneBackground({ isKids = false }: { isKids?: boolean }) {
  return isKids ? <KidsBackground /> : <ProBackground />
}
