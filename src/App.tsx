import { useState, useEffect } from 'react'
import { FeedScreen } from '@/features/feed/FeedScreen'
import { ChallengeScreen } from '@/features/challenge/ChallengeScreen'
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen'
import './styles/global.css'

type ActiveScreen = 'feed' | 'challenge'

function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem('bububu:progress') !== null
  } catch {
    return false
  }
}

// Detecta iOS Safari (não suporta beforeinstallprompt)
function isIosSafari(): boolean {
  const ua = navigator.userAgent
  const isIos = /iP(hone|ad|od)/.test(ua)
  const isStandalone = ('standalone' in navigator) && (navigator as any).standalone === true
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIos && isSafari && !isStandalone
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(hasCompletedOnboarding)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('feed')
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [installDismissed, setInstallDismissed] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstallPrompt(null))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // iOS: mostra dica de instalação após 8s na primeira visita
  useEffect(() => {
    if (!isIosSafari()) return
    if (localStorage.getItem('bub_ios_hint')) return
    const t = setTimeout(() => setIosHint(true), 8000)
    return () => clearTimeout(t)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
    else setInstallDismissed(true)
  }

  if (!onboardingDone) {
    return (
      /* Desktop shell para onboarding também */
      <div style={{ height: '100dvh', display: 'flex', justifyContent: 'center', background: '#07011a' }}>
        <div style={{ width: '100%', maxWidth: 480, overflow: 'hidden' }}>
          <OnboardingScreen onComplete={() => setOnboardingDone(true)} />
        </div>
      </div>
    )
  }

  return (
    /* ── Desktop shell: fundo escuro, app centrado em 480px ── */
    <div style={{
      height: '100dvh',
      display: 'flex',
      justifyContent: 'center',
      background: '#07011a',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 80px rgba(124,58,237,0.20)',
      }}>

        {/* ── PWA Install banner (topo, fora do conteúdo) ─────────── */}
        {installPrompt && !installDismissed && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 14px',
            background: 'linear-gradient(90deg, #4c1d95, #7c3aed)',
            flexShrink: 0,
            gap: 10,
            zIndex: 50,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📲</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  Instalar o Bububu
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.2 }}>
                  Acesse offline como app nativo
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleInstall}
                style={{
                  padding: '7px 14px', borderRadius: 10, border: 'none',
                  background: '#fff', color: '#7c3aed',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Instalar
              </button>
              <button
                onClick={() => setInstallDismissed(true)}
                style={{
                  padding: '7px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.30)',
                  background: 'transparent', color: 'rgba(255,255,255,0.70)',
                  fontSize: 12, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── iOS install hint (bottom sheet) ──────────────────────── */}
        {iosHint && (
          <div
            onClick={() => { setIosHint(false); localStorage.setItem('bub_ios_hint', '1') }}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              padding: '0 12px 12px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(20,5,50,0.98)',
                border: '1px solid rgba(167,139,250,0.30)',
                borderRadius: 20, padding: '20px 22px 24px',
                width: '100%', maxWidth: 440,
                animation: 'slideUp 0.30s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: '#c084fc', marginBottom: 12, letterSpacing: 0.3 }}>
                📲 Instalar o Bububu no iPhone
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([
                  { icon: '1️⃣', text: 'Toque no botão de compartilhar', sub: '(ícone de seta para cima, na barra do Safari)' },
                  { icon: '2️⃣', text: 'Role para baixo e toque em', sub: '"Adicionar à Tela de Início"' },
                  { icon: '3️⃣', text: 'Toque em "Adicionar"', sub: 'O Bububu vai aparecer como um app' },
                ] as {icon:string; text:string; sub:string}[]).map(step => (
                  <div key={step.icon} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, lineHeight: 1.3 }}>{step.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e9d5ff', lineHeight: 1.3 }}>{step.text}</div>
                      <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.55)', lineHeight: 1.3 }}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seta animada apontando para a barra do Safari */}
              <div style={{
                marginTop: 16,
                background: 'rgba(124,58,237,0.18)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: 12, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 22 }}>⬆️</span>
                <span style={{ fontSize: 12, color: 'rgba(196,181,253,0.75)', lineHeight: 1.3 }}>
                  O ícone de compartilhar fica na barra inferior do Safari
                </span>
              </div>

              <button
                onClick={() => { setIosHint(false); localStorage.setItem('bub_ios_hint', '1') }}
                style={{
                  marginTop: 16, width: '100%',
                  padding: '11px', borderRadius: 12, border: 'none',
                  background: '#7c3aed', color: '#fff',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* ── Conteúdo ─────────────────────────────────────────────── */}
        <div style={{
          flex: 1, overflow: 'hidden', position: 'relative',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          {activeScreen === 'feed'
            ? <FeedScreen onResetToOnboarding={() => setOnboardingDone(false)} />
            : <ChallengeScreen />
          }
        </div>

        {/* ── Bottom Nav ───────────────────────────────────────────── */}
        <nav style={{
          display: 'flex',
          borderTop: '1px solid rgba(196,132,252,0.25)',
          background: 'rgba(10,4,30,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          flexShrink: 0,
        }}>
          {([
            { id: 'feed',      label: 'Alimentar',  icon: '🍽️' },
            { id: 'challenge', label: 'Desafio',    icon: '🎯' },
          ] as { id: ActiveScreen; label: string; icon: string }[]).map(tab => {
            const active = activeScreen === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveScreen(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 0 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: 20 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: active ? 800 : 500,
                  color: active ? '#c084fc' : 'rgba(220,185,255,0.68)',
                  letterSpacing: 0.3,
                }}>
                  {tab.label}
                </span>
                {active && (
                  <div style={{
                    width: 20,
                    height: 3,
                    borderRadius: 99,
                    background: '#7c3aed',
                    marginTop: 2,
                  }} />
                )}
              </button>
            )
       