import { useCallback, useState } from 'react'
import type { AppMode } from '@/types'

interface Props {
  mode:         AppMode
  level:        number
  wordsLearned: number
  streak:       number
  userName?:    string
  onClose:      () => void
}

async function renderCardToBlob(
  mode: AppMode, level: number, wordsLearned: number, streak: number, userName?: string,
): Promise<Blob> {
  const W = 540; const H = 960
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  const isKids = mode === 'kids'

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  if (isKids) {
    bg.addColorStop(0, '#87CEEB'); bg.addColorStop(0.5, '#B0E0FF'); bg.addColorStop(1, '#DDFFD4')
  } else {
    bg.addColorStop(0, '#1a0533'); bg.addColorStop(0.5, '#2d0f5c'); bg.addColorStop(1, '#0d0826')
  }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Estrelas (Pro)
  if (!isKids) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    for (const [x,y,r] of [[60,80,2],[200,140,1.5],[420,60,1],[350,200,2.5],[100,300,1.5],[480,250,2]]) {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill()
    }
  }

  // Bububu SVG
  const bodyColor = isKids ? '#fbbf24' : '#a78bfa'
  const svgSrc = `<svg width="220" height="260" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="135" rx="42" ry="7" fill="rgba(0,0,0,0.10)"/>
    <path d="M 60 8 C 98 8,112 32,111 64 C 110 96,94 122,60 126 C 26 122,10 96,9 64 C 8 32,22 8,60 8 Z" fill="${bodyColor}"/>
    <ellipse cx="38" cy="30" rx="15" ry="9" fill="rgba(255,255,255,0.35)" transform="rotate(-20 38 30)"/>
    <circle cx="24" cy="74" r="11" fill="rgba(255,100,100,0.30)"/>
    <circle cx="96" cy="74" r="11" fill="rgba(255,100,100,0.30)"/>
    <path d="M 34 48 Q 44 40 54 48" stroke="#1a1a2e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M 66 48 Q 76 40 86 48" stroke="#1a1a2e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M 38 78 Q 60 98 82 78" stroke="#1a1a2e" stroke-width="3.5" fill="rgba(167,139,250,0.3)" stroke-linecap="round"/>
  </svg>`
  const svgBlob = new Blob([svgSrc], { type: 'image/svg+xml' })
  const svgUrl  = URL.createObjectURL(svgBlob)
  const img = new Image()
  await new Promise<void>(res => { img.onload = () => res(); img.src = svgUrl })
  ctx.drawImage(img, W/2 - 110, 150, 220, 260)
  URL.revokeObjectURL(svgUrl)

  ctx.textAlign = 'center'

  // App name
  ctx.fillStyle = isKids ? 'rgba(45,31,107,0.50)' : 'rgba(196,181,253,0.50)'
  ctx.font = '500 22px system-ui,sans-serif'
  ctx.fillText('bububu', W/2, 58)

  // LVL badge
  const bw = 110; const bh = 36; const bx = W/2 - bw/2; const by = 80; const br = 18
  ctx.beginPath()
  ctx.moveTo(bx+br,by); ctx.lineTo(bx+bw-br,by); ctx.arcTo(bx+bw,by,bx+bw,by+br,br)
  ctx.lineTo(bx+bw,by+bh-br); ctx.arcTo(bx+bw,by+bh,bx+bw-br,by+bh,br)
  ctx.lineTo(bx+br,by+bh); ctx.arcTo(bx,by+bh,bx,by+bh-br,br)
  ctx.lineTo(bx,by+br); ctx.arcTo(bx,by,bx+br,by,br); ctx.closePath()
  ctx.fillStyle = isKids ? '#f59e0b' : '#7c3aed'; ctx.fill()
  ctx.fillStyle = 'white'; ctx.font = '900 18px system-ui,sans-serif'
  ctx.fillText(`LVL ${level}`, W/2, by+25)

  // Linha separadora
  ctx.strokeStyle = isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(60, 470); ctx.lineTo(W-60, 470); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(60, 540); ctx.lineTo(W-60, 540); ctx.stroke()

  // Stats — palavras
  ctx.fillStyle = isKids ? '#92400e' : '#e9d5ff'
  ctx.font = '900 62px system-ui,sans-serif'
  ctx.fillText(`${wordsLearned}`, W/2 - 90, 525)
  ctx.fillStyle = isKids ? 'rgba(120,60,0,0.55)' : 'rgba(196,181,253,0.55)'
  ctx.font = '400 17px system-ui,sans-serif'
  ctx.fillText('palavras', W/2 - 90, 553)

  // Separador vertical
  ctx.strokeStyle = isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(W/2, 478); ctx.lineTo(W/2, 548); ctx.stroke()

  // Stats — streak
  ctx.fillStyle = isKids ? '#92400e' : '#e9d5ff'
  ctx.font = '900 62px system-ui,sans-serif'
  ctx.fillText(streak > 0 ? `${streak}` : '—', W/2 + 90, 525)
  ctx.fillStyle = isKids ? 'rgba(120,60,0,0.55)' : 'rgba(196,181,253,0.55)'
  ctx.font = '400 17px system-ui,sans-serif'
  ctx.fillText(streak > 0 ? (streak === 1 ? '🔥 dia' : '🔥 dias') : 'dias', W/2 + 90, 553)

  // Rodapé
  ctx.fillStyle = isKids ? 'rgba(45,31,107,0.30)' : 'rgba(196,181,253,0.22)'
  ctx.font = '400 14px system-ui,sans-serif'
  ctx.fillText(
    userName
      ? `${userName} aprende inglês com o Bububu 🫧`
      : 'Aprenda inglês com o Bububu 🫧',
    W/2, H - 38,
  )

  return new Promise(res => canvas.toBlob(b => res(b!), 'image/png'))
}

export function ShareCard({ mode, level, wordsLearned, streak, userName, onClose }: Props) {
  const [sharing, setSharing] = useState(false)
  const isKids = mode === 'kids'
  const bodyColor = isKids ? '#fbbf24' : '#a78bfa'

  const handleShare = useCallback(async () => {
    setSharing(true)
    try {
      const blob = await renderCardToBlob(mode, level, wordsLearned, streak, userName)
      const file = new File([blob], 'bububu-progress.png', { type: 'image/png' })
      const shareText = userName
        ? `${userName} está no nível ${level} com ${wordsLearned} palavras no Bububu! 🫧`
        : `Estou no nível ${level} com ${wordsLearned} palavras! 🫧`
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Meu Bububu', text: shareText })
      } else {
        const url = URL.createObjectURL(blob)
        Object.assign(document.createElement('a'), { href: url, download: 'bububu-progress.png' }).click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setSharing(false)
    }
  }, [mode, level, wordsLearned, streak, userName])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 300, borderRadius: 28, padding: '28px 24px 20px',
        background: isKids
          ? 'linear-gradient(170deg,#87CEEB 0%,#B0E0FF 50%,#DDFFD4 100%)'
          : 'linear-gradient(170deg,#1a0533 0%,#2d0f5c 50%,#0d0826 100%)',
        boxShadow: `0 24px 80px ${isKids ? 'rgba(251,191,36,0.30)' : 'rgba(124,58,237,0.50)'}`,
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: isKids ? 'rgba(45,31,107,0.45)' : 'rgba(196,181,253,0.45)', marginBottom: 8 }}>
          🫧 bububu{userName ? ` · ${userName}` : ''}
        </div>
        <div style={{ display: 'inline-block', background: isKids ? '#f59e0b' : '#7c3aed', color: 'white', fontWeight: 900, fontSize: 13, padding: '4px 16px', borderRadius: 20, marginBottom: 14 }}>LVL {level}</div>
        <div style={{ margin: '0 auto 12px' }}>
          <svg width="120" height="138" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="135" rx="42" ry="7" fill="rgba(0,0,0,0.10)" />
            <path d="M 60 8 C 98 8,112 32,111 64 C 110 96,94 122,60 126 C 26 122,10 96,9 64 C 8 32,22 8,60 8 Z" fill={bodyColor} />
            <ellipse cx="38" cy="30" rx="15" ry="9" fill="rgba(255,255,255,0.35)" transform="rotate(-20 38 30)" />
            <circle cx="24" cy="74" r="11" fill="rgba(255,100,100,0.30)" />
            <circle cx="96" cy="74" r="11" fill="rgba(255,100,100,0.30)" />
            <path d="M 34 48 Q 44 40 54 48" stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 66 48 Q 76 40 86 48" stroke="#1a1a2e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 38 78 Q 60 98 82 78" stroke="#1a1a2e" strokeWidth="3.5" fill="rgba(167,139,250,0.3)" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: `1px solid ${isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)'}`, borderBottom: `1px solid ${isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)'}`, padding: '12px 0', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: isKids ? '#92400e' : '#e9d5ff' }}>{wordsLearned}</div>
            <div style={{ fontSize: 11, color: isKids ? 'rgba(120,60,0,0.50)' : 'rgba(196,181,253,0.50)' }}>palavras</div>
          </div>
          <div style={{ width: 1, height: 36, background: isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)' }} />
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: isKids ? '#92400e' : '#e9d5ff' }}>{streak > 0 ? `${streak} 🔥` : '—'}</div>
            <div style={{ fontSize: 11, color: isKids ? 'rgba(120,60,0,0.50)' : 'rgba(196,181,253,0.50)' }}>{streak === 1 ? 'dia' : 'dias'}</div>
          </div>
        </div>
        <button onClick={handleShare} disabled={sharing} style={{ width: '100%', background: isKids ? '#f59e0b' : '#7c3aed', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 14, padding: '13px', cursor: sharing ? 'wait' : 'pointer', opacity: sharing ? 0.7 : 1 }}>
          {sharing ? 'Gerando...' : '📤 Compartilhar'}
        </button>
        <button onClick={onClose} style={{ marginTop: 8, background: 'transparent', border: 'none', fontSize: 12, color: isKids ? 'rgba(120,60,0,0.35)' : 'rgba(196,181,253,0.30)', cursor: 'pointer', padding: '6px' }}>Fechar</button>
      </div>
    </div>
  )
}
