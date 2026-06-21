import { useState } from 'react'
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

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(hasCompletedOnboarding)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('feed')

  if (!onboardingDone) {
    return <OnboardingScreen onComplete={() => setOnboardingDone(true)} />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: 'transparent',
      overflow: 'hidden',
    }}>
      {/* ── Conteúdo ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeScreen === 'feed'
          ? <FeedScreen />
          : <ChallengeScreen />
        }
      </div>

      {/* ── Bottom Nav ──────────────────────────────────────────── */}
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
                padding: '14px 0 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span style={{
                fontSize: 11,
                fontWeight: active ? 800 : 500,
                color: active ? '#c084fc' : 'rgba(196,132,252,0.45)',
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
        })}
      </nav>
    </div>
  )
}
