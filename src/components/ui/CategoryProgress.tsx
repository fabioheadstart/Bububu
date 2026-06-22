import { useMemo } from 'react'
import { ALL_WORDS } from '@/data/vocabulary'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import type { DifficultyLevel } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  wordsLearned: string[]
  level: number
  difficulty: DifficultyLevel
}

interface CategoryStat {
  category: string
  label: string
  cefrLevel: 'A1' | 'A2' | 'B1'
  total: number
  learned: number
  locked: boolean
}

const CEFR_GROUPS: { cefr: 'A1' | 'A2' | 'B1'; label: string; unlockLevel: number }[] = [
  { cefr: 'A1', label: 'Básico',        unlockLevel: 1  },
  { cefr: 'A2', label: 'Intermediário', unlockLevel: 5  },
  { cefr: 'B1', label: 'Avançado',      unlockLevel: 10 },
]

function buildStats(wordsLearned: string[], level: number, difficulty: DifficultyLevel): CategoryStat[] {
  // Count totals per category
  const totals: Record<string, { total: number; cefrLevel: 'A1' | 'A2' | 'B1' }> = {}
  for (const w of ALL_WORDS) {
    if (!totals[w.category]) totals[w.category] = { total: 0, cefrLevel: w.level as 'A1' | 'A2' | 'B1' }
    totals[w.category].total++
  }

  // Count learned per category
  const learnedSet = new Set(wordsLearned)
  const learnedPerCat: Record<string, number> = {}
  for (const w of ALL_WORDS) {
    if (learnedSet.has(w.id)) {
      learnedPerCat[w.category] = (learnedPerCat[w.category] ?? 0) + 1
    }
  }

  // Build stats, determine locked
  return Object.entries(totals).map(([category, { total, cefrLevel }]) => {
    const group = CEFR_GROUPS.find(g => g.cefr === cefrLevel)!
    const locked = difficulty === 'easy' && level < group.unlockLevel

    return {
      category,
      label: getCategoryColor(category).label || category,
      cefrLevel,
      total,
      learned: learnedPerCat[category] ?? 0,
      locked,
    }
  })
}

export function CategoryProgress({ open, onClose, wordsLearned, level, difficulty }: Props) {
  const stats = useMemo(
    () => buildStats(wordsLearned, level, difficulty),
    [wordsLearned, level, difficulty]
  )

  if (!open) return null

  const totalLearned = stats.reduce((s, c) => s + c.learned, 0)
  const totalWords   = stats.reduce((s, c) => s + c.total, 0)

  return (
    <>
      <style>{`
        @keyframes cp-sheet {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes cp-bg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cp-bar {
          from { width: 0; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(10,0,30,0.72)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'cp-bg 0.22s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
        background: '#0f0a1e',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(167,139,250,0.15)',
        borderBottom: 'none',
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        animation: 'cp-sheet 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: 'rgba(255,255,255,0.15)',
          margin: '18px auto 0',
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          padding: '14px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#f0e6ff' }}>
              Vocabulário
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
              {totalLearned} de {totalWords} palavras aprendidas
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 22,
              cursor: 'pointer', padding: '4px 8px', lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Overall bar */}
        <div style={{ padding: '12px 20px 4px', flexShrink: 0 }}>
          <div style={{
            height: 6, borderRadius: 99,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${totalWords > 0 ? (totalLearned / totalWords) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              borderRadius: 99,
              animation: 'cp-bar 0.8s ease',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '8px 20px 32px', flex: 1 }}>
          {CEFR_GROUPS.map(group => {
            const groupStats = stats
              .filter(s => s.cefrLevel === group.cefr)
              .sort((a, b) => b.total - a.total)

            const groupLearned = groupStats.reduce((s, c) => s + c.learned, 0)
            const groupTotal   = groupStats.reduce((s, c) => s + c.total,   0)
            const isLocked     = difficulty === 'easy' && level < group.unlockLevel

            return (
              <div key={group.cefr} style={{ marginBottom: 20 }}>
                {/* Group header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 10, marginTop: 12,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                    color: isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(167,139,250,0.7)',
                    textTransform: 'uppercase',
                  }}>
                    {group.cefr} — {group.label}
                  </div>
                  {isLocked && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>🔒 nível {group.unlockLevel}</span>
                  )}
                  {!isLocked && (
                    <div style={{
                      marginLeft: 'auto',
                      fontSize: 11, color: 'rgba(255,255,255,0.3)',
                    }}>
                      {groupLearned}/{groupTotal}
                    </div>
                  )}
                </div>

                {/* Category rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {groupStats.map(s => {
                    const color = getCategoryColor(s.category)
                    const pct   = s.total > 0 ? s.learned / s.total : 0
                    const mastered = pct >= 1

                    return (
                      <div
                        key={s.category}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px',
                          borderRadius: 14,
                          background: isLocked || s.locked
                            ? 'rgba(255,255,255,0.02)'
                            : mastered
                            ? 'rgba(74,222,128,0.06)'
                            : 'rgba(255,255,255,0.04)',
                          border: mastered
                            ? '1px solid rgba(74,222,128,0.18)'
                            : '1px solid rgba(255,255,255,0.05)',
                          opacity: isLocked || s.locked ? 0.35 : 1,
                        }}
                      >
                        {/* Color dot */}
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                          background: color.bg,
                          boxShadow: mastered ? `0 0 8px ${color.glow}` : 'none',
                        }} />

                        {/* Name */}
                        <div style={{
                          flex: 1, fontSize: 14, fontWeight: 600,
                          color: mastered ? '#4ade80' : 'rgba(255,255,255,0.8)',
                        }}>
                          {color.label || s.category}
                        </div>

                        {/* Count */}
                        <div style={{
                          fontSize: 12, color: 'rgba(255,255,255,0.35)',
                          minWidth: 36, textAlign: 'right',
                        }}>
                          {s.learned}/{s.total}
                        </div>

                        {/* Bar */}
                        <div style={{
                          width: 60, height: 5, borderRadius: 99,
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden', flexShrink: 0,
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct * 100}%`,
                            background: mastered
                              ? '#4ade80'
                              : `linear-gradient(90deg, ${color.bg}, ${color.ring})`,
                            borderRadius: 99,
                            animation: 'cp-bar 0.8s ease',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>

                        {/* Mastered badge */}
                        {mastered && (
                          <span style={{ fontSize: 14, flexShrink: 0 }}>✅</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
