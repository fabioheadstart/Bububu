import type { KidsWorldId } from '@/hooks/useKidsWorld'
import { WORLD_META, WORLD_UNLOCK_LEVEL } from '@/hooks/useKidsWorld'

interface Props {
  activeWorld:    KidsWorldId
  unlockedWorlds: KidsWorldId[]
  onSwitch:       (id: KidsWorldId) => void
  direction?:     'row' | 'column'
  currentLevel?:  number   // para o arco de progresso nos botões bloqueados
  maxLevel?:      number   // nível máximo do tier atual (para calcular %)
}

const ALL_WORLDS: KidsWorldId[] = [1, 2, 3]
const BTN = 36   // tamanho do botão em px
const R   = 15   // raio do arco SVG
const CIRC = 2 * Math.PI * R  // circunferência

export function WorldSwitcher({
  activeWorld, unlockedWorlds, onSwitch,
  direction = 'row', currentLevel = 1, maxLevel = 15,
}: Props) {
  const unlockedSet = new Set(unlockedWorlds)

  return (
    <div style={{
      display: 'flex',
      flexDirection: direction,
      gap: 8,
      alignItems: 'center',
    }}>
      {ALL_WORLDS.map(id => {
        const unlocked    = unlockedSet.has(id)
        const active      = id === activeWorld
        const meta        = WORLD_META[id]
        const unlockLevel = WORLD_UNLOCK_LEVEL[id]

        // Progresso em direção ao unlock (0–1)
        const progress = unlocked ? 1 : Math.min(1, currentLevel / unlockLevel)
        const dashOffset = CIRC * (1 - progress)

        return (
          <div
            key={id}
            style={{ position: 'relative', width: BTN, height: BTN, flexShrink: 0 }}
            title={unlocked ? meta.name : `${meta.name} — nível ${unlockLevel}`}
          >
            {/* Arco de progresso SVG — só para bloqueados */}
            {!unlocked && (
              <svg
                width={BTN} height={BTN}
                viewBox={`0 0 ${BTN} ${BTN}`}
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              >
                {/* Track */}
                <circle
                  cx={BTN / 2} cy={BTN / 2} r={R}
                  fill="none"
                  stroke="rgba(45,31,107,0.12)"
                  strokeWidth="2.5"
                />
                {/* Progresso */}
                <circle
                  cx={BTN / 2} cy={BTN / 2} r={R}
                  fill="none"
                  stroke="rgba(124,58,237,0.55)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={`${dashOffset}`}
                  transform={`rotate(-90 ${BTN / 2} ${BTN / 2})`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
            )}

            <button
              onClick={() => { if (unlocked) onSwitch(id) }}
              disabled={!unlocked}
              style={{
                width: BTN, height: BTN,
                borderRadius: '50%',
                border: active
                  ? '2px solid rgba(255,200,60,0.90)'
                  : unlocked
                    ? '2px solid rgba(45,31,107,0.22)'
                    : 'none',                // borda gerenciada pelo SVG
                background: active
                  ? 'rgba(255,220,80,0.28)'
                  : unlocked
                    ? 'rgba(255,255,255,0.38)'
                    : 'rgba(255,255,255,0.20)',
                boxShadow: active ? '0 0 10px rgba(255,200,60,0.55)' : 'none',
                cursor: unlocked ? 'pointer' : 'default',
                fontSize: unlocked ? 17 : 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
                transition: 'all 0.18s',
                opacity: unlocked ? 1 : 0.70,
                WebkitTapHighlightColor: 'transparent',
                position: 'relative', zIndex: 1,
              }}
            >
              {unlocked ? meta.emoji : '🔒'}
            </button>

            {/* Badge de nível necessário — só para bloqueados */}
            {!unlocked && (
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                background: 'rgba(124,58,237,0.85)',
                color: '#fff',
                fontSize: 8, fontWeight: 900,
                borderRadius: 99,
                padding: '1px 4px',
                lineHeight: 1.4,
                pointerEvents: 'none',
                zIndex: 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}>
                {unlockLevel}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
