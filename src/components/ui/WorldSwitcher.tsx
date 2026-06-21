import type { KidsWorldId } from '@/hooks/useKidsWorld'
import { WORLD_META, WORLD_UNLOCK_LEVEL } from '@/hooks/useKidsWorld'

interface Props {
  activeWorld:    KidsWorldId
  unlockedWorlds: KidsWorldId[]
  onSwitch:       (id: KidsWorldId) => void
}

const ALL_WORLDS: KidsWorldId[] = [1, 2, 3]

export function WorldSwitcher({ activeWorld, unlockedWorlds, onSwitch }: Props) {
  const unlockedSet = new Set(unlockedWorlds)

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      alignItems: 'center',
    }}>
      {ALL_WORLDS.map(id => {
        const unlocked = unlockedSet.has(id)
        const active   = id === activeWorld
        const meta     = WORLD_META[id]

        return (
          <button
            key={id}
            onClick={() => { if (unlocked) onSwitch(id) }}
            disabled={!unlocked}
            title={unlocked ? meta.name : `Desbloqueie no nível ${WORLD_UNLOCK_LEVEL[id]}`}
            style={{
              width: 30, height: 30,
              borderRadius: '50%',
              border: active
                ? '2px solid rgba(255,200,60,0.85)'
                : '2px solid rgba(45,31,107,0.18)',
              background: active
                ? 'rgba(255,220,80,0.22)'
                : unlocked
                  ? 'rgba(255,255,255,0.28)'
                  : 'rgba(200,200,200,0.15)',
              boxShadow: active ? '0 0 8px rgba(255,200,60,0.50)' : 'none',
              cursor: unlocked ? 'pointer' : 'not-allowed',
              fontSize: unlocked ? 15 : 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              transition: 'all 0.18s',
              opacity: unlocked ? 1 : 0.45,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {unlocked ? meta.emoji : '🔒'}
          </button>
        )
      })}
    </div>
  )
}
