import { useState } from 'react'
import type { AppMode, DifficultyLevel } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  // stats
  level: number
  wordsLearned: number
  streak: number
  // current values
  mode: AppMode
  difficulty: DifficultyLevel
  // actions
  onSetMode: (m: AppMode) => void
  onSetDifficulty: (d: DifficultyLevel) => void
  onReset: () => void
  onShowProgress: () => void
}

const MODES: { value: AppMode; label: string; icon: string; color: string }[] = [
  { value: 'kids', label: 'Kids',  icon: '🌱', color: '#34d399' },
  { value: 'pro',  label: 'Pro',   icon: '👑', color: '#c084fc' },
]

const DIFFICULTIES: { value: DifficultyLevel; label: string; icon: string }[] = [
  { value: 'easy',   label: 'Fácil',   icon: '🌱' },
  { value: 'medium', label: 'Médio',   icon: '⚡' },
  { value: 'hard',   label: 'Difícil', icon: '🔥' },
]

export function SettingsPanel({
  open, onClose,
  level, wordsLearned, streak,
  mode, difficulty,
  onSetMode, onSetDifficulty, onReset, onShowProgress,
}: Props) {
  const [confirmReset, setConfirmReset] = useState(false)

  function handleReset() {
    onReset()
    setConfirmReset(false)
    onClose()
  }

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(10,0,30,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'overlay-in 0.22s ease',
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301,
          background: '#0f0a1e',
          borderRadius: '24px 24px 0 0',
          border: '1px solid rgba(167,139,250,0.15)',
          borderBottom: 'none',
          padding: '20px 20px 40px',
          animation: 'sheet-up 0.32s cubic-bezier(0.34,1.56,0.64,1)',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* Handle + botão fechar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1 }} />
          <div style={{
            width: 36, height: 4, borderRadius: 99,
            background: 'rgba(255,255,255,0.15)',
          }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, color: 'rgba(255,255,255,0.55)',
                fontSize: 13, fontWeight: 700,
                padding: '4px 10px', cursor: 'pointer',
                lineHeight: 1.4,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 24,
        }}>
          {[
            { label: 'nível',    value: level,        icon: '⭐' },
            { label: 'palavras', value: wordsLearned, icon: '📚' },
            { label: 'sequência',value: streak,       icon: '🔥' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(167,139,250,0.12)',
              borderRadius: 14, padding: '12px 6px',
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e9d5ff', lineHeight: 1.2 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Modo ── */}
        <SectionLabel>Modo</SectionLabel>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => onSetMode(m.value)}
              style={{
                flex: 1, padding: '12px 8px',
                borderRadius: 14,
                border: `2px solid ${mode === m.value ? m.color : 'rgba(255,255,255,0.08)'}`,
                background: mode === m.value ? `${m.color}18` : 'transparent',
                cursor: 'pointer',
                color: mode === m.value ? m.color : 'rgba(255,255,255,0.45)',
                fontWeight: 700, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.18s ease',
              }}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        {/* ── Dificuldade ── */}
        <SectionLabel>Dificuldade</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              onClick={() => onSetDifficulty(d.value)}
              style={{
                flex: 1, padding: '10px 4px',
                borderRadius: 14,
                border: `2px solid ${difficulty === d.value ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
                background: difficulty === d.value ? 'rgba(167,139,250,0.14)' : 'transparent',
                cursor: 'pointer',
                color: difficulty === d.value ? '#e9d5ff' : 'rgba(255,255,255,0.38)',
                fontWeight: 700, fontSize: 13,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: 18 }}>{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>

        {/* ── Pronto ── */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: 'pointer', marginBottom: 14,
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          }}
        >
          Pronto ✓
        </button>

        {/* ── Progresso por categoria ── */}
        <button
          onClick={onShowProgress}
          style={{
            width: '100%', padding: '13px',
            borderRadius: 14, border: '1px solid rgba(167,139,250,0.20)',
            background: 'rgba(124,58,237,0.10)',
            color: 'rgba(196,181,253,0.85)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', marginBottom: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          📚 Ver vocabulário por categoria
        </button>

        {/* ── Reset ── */}
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 14, border: '1px solid rgba(248,113,113,0.25)',
              background: 'rgba(248,113,113,0.06)',
              color: 'rgba(248,113,113,0.7)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Resetar progresso
          </button>
        ) : (
          <div style={{
            borderRadius: 14, border: '1px solid rgba(248,113,113,0.35)',
            background: 'rgba(248,113,113,0.08)',
            padding: '16px',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              Isso apaga todo o progresso do Bububu. Tem certeza?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
                  background: 'transparent', color: 'rgba(255,255,255,0.5)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 12, border: 'none',
                  background: '#ef4444', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Resetar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}
