import { useState, useEffect, useRef } from 'react'

export type KidsWorldId = 1 | 2 | 3

// Nível mínimo para desbloquear cada mundo
export const WORLD_UNLOCK_LEVEL: Record<KidsWorldId, number> = {
  1: 1,
  2: 2,   // ~36 palavras — primeiras sessões
  3: 5,   // ~180 palavras — mid-game
}

export const WORLD_META: Record<KidsWorldId, { emoji: string; name: string }> = {
  1: { emoji: '☀️', name: 'Jardim do Bububu' },
  2: { emoji: '🌊', name: 'Fundo do Mar' },
  3: { emoji: '🍭', name: 'Terra dos Doces' },
}

const STORAGE_KEY = 'bub_kids_world'

function getUnlocked(level: number): KidsWorldId[] {
  return ([1, 2, 3] as KidsWorldId[]).filter(w => level >= WORLD_UNLOCK_LEVEL[w])
}

function loadSaved(): KidsWorldId {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === '1' || v === '2' || v === '3') return Number(v) as KidsWorldId
  } catch { /* ignore */ }
  return 1
}

export function useKidsWorld(computedLevel: number, isKids: boolean) {
  const [activeWorld, setActiveWorldState] = useState<KidsWorldId>(() => loadSaved())
  const [newlyUnlocked, setNewlyUnlocked] = useState<KidsWorldId | null>(null)
  const prevUnlockedRef = useRef<KidsWorldId[]>(getUnlocked(computedLevel))

  // Detecta novos mundos desbloqueados a cada mudança de nível
  useEffect(() => {
    if (!isKids) return
    const current = getUnlocked(computedLevel)
    const prev    = prevUnlockedRef.current
    const justUnlocked = current.filter(w => !prev.includes(w))
    if (justUnlocked.length > 0) {
      // Celebra o mais alto recém-desbloqueado e muda automaticamente para ele
      const newest = justUnlocked[justUnlocked.length - 1]
      setNewlyUnlocked(newest)
      setActiveWorldState(newest)
      try { localStorage.setItem(STORAGE_KEY, String(newest)) } catch { /* ignore */ }
    }
    prevUnlockedRef.current = current
  }, [computedLevel, isKids])

  // Garante que o mundo ativo está desbloqueado (ex.: se o usuário mudou de Kids → Pro e voltou)
  useEffect(() => {
    if (!isKids) return
    const unlocked = getUnlocked(computedLevel)
    if (!unlocked.includes(activeWorld)) {
      setActiveWorldState(1)
      try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    }
  }, [computedLevel, isKids, activeWorld])

  const setWorld = (id: KidsWorldId) => {
    setActiveWorldState(id)
    try { localStorage.setItem(STORAGE_KEY, String(id)) } catch { /* ignore */ }
  }

  const dismissNewlyUnlocked = () => setNewlyUnlocked(null)

  return {
    activeWorld:    isKids ? activeWorld : 1 as KidsWorldId,
    unlockedWorlds: getUnlocked(computedLevel),
    setWorld,
    newlyUnlocked,
    dismissNewlyUnlocked,
  }
}
