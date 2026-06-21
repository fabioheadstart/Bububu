import { useState, useEffect } from 'react'
import type { AppMode } from '@/types'

export type PetMood = 'happy' | 'neutral' | 'hungry' | 'sad' | 'very_sad' | 'sleeping' | 'just_woke'

interface PetState {
  petMood:    PetMood
  isSleeping: boolean
  hoursHungry: number
}

function getSleepHours(mode: AppMode): { start: number; end: number } {
  return mode === 'kids' ? { start: 20, end: 7 } : { start: 22, end: 7 }
}

function checkSleeping(mode: AppMode): boolean {
  const hour = new Date().getHours()
  const { start, end } = getSleepHours(mode)
  return hour >= start || hour < end
}

function getHoursHungry(lastFedAt: number): number {
  if (!lastFedAt) return 99
  return (Date.now() - lastFedAt) / (1000 * 60 * 60)
}

function moodFromHours(hours: number, isSleeping: boolean): PetMood {
  if (isSleeping) return 'sleeping'
  if (hours < 2)  return 'happy'
  if (hours < 6)  return 'neutral'
  if (hours < 12) return 'hungry'
  if (hours < 48) return 'sad'
  return 'very_sad'
}

export function usePetState(mode: AppMode, lastFedAt: number): PetState {
  const [, setTick] = useState(0)

  // Re-renderiza a cada minuto — hora pode mudar (acordar / dormir)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const isSleeping  = checkSleeping(mode)
  const hoursHungry = getHoursHungry(lastFedAt)
  const petMood     = moodFromHours(hoursHungry, isSleeping)

  return { petMood, isSleeping, hoursHungry }
}
