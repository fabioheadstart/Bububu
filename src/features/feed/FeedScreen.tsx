import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ConfettiRain } from '@/components/ui/ConfettiRain'
import { ParticleBurst } from '@/components/ui/ParticleBurst'
import type { BurstData } from '@/components/ui/ParticleBurst'
import { PoopReveal } from '@/components/ui/PoopReveal'
import { MasteryToast } from '@/components/ui/MasteryToast'
import { WordChips } from '@/components/ui/WordChips'
import { FlyingChip } from '@/components/ui/FlyingChip'
import { XpBar } from '@/components/ui/XpBar'
import { LevelUpOverlay } from '@/components/ui/LevelUpOverlay'
import { ComboOverlay } from '@/components/ui/ComboOverlay'
import type { ComboData } from '@/components/ui/ComboOverlay'
import { BububuCharacter, getStage } from '@/components/bububu/BububuCharacter'
import { useFeed } from '@/features/feed/useFeed'
import { useBububuVoice, useAudio } from '@/lib/audio/useAudio'
import {
  playWhoosh,
  playSnap,
  playMunch,
  playFart,
  playFartBonus,
  playFartJackpot,
  playBububuSuper,
  playPresentPop,
  hapticPresentPop,
  preloadJackpotFart,
  playCoinNormal,
  playCoinBonus,
  playCoinJackpot,
  playComboTrio,
  playComboVS,
  playKonami,
  hapticBonus,
  hapticJackpot,
  hapticCombo,
  hapticKonami,
} from '@/lib/audio/sounds'
import { OPPOSITE_PAIRS } from '@/data/vocabulary/opposites'
import { getCategoryColor } from '@/data/vocabulary/categoryColors'
import { useProgress } from '@/hooks/useProgress'
import { useTheme } from '@/hooks/useTheme'
import { usePetState } from '@/hooks/usePetState'
import { SceneBackground } from '@/components/ui/SceneBackground'
import { WorldSwitcher } from '@/components/ui/WorldSwitcher'
import { WorldUnlockOverlay } from '@/components/ui/WorldUnlockOverlay'
import { useKidsWorld } from '@/hooks/useKidsWorld'
import { BububuSpeech } from '@/components/ui/BububuSpeech'
import { getBubPhrase } from '@/data/bububuPhrases'
import { FloatingIsland } from '@/components/ui/FloatingIsland'
import { BububuPhone } from '@/components/ui/BububuPhone'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { CategoryProgress } from '@/components/ui/CategoryProgress'
import { SleepScreen } from '@/features/feed/SleepScreen'
import { SuperPeidoOverlay } from '@/components/ui/SuperPeidoOverlay'
import { EvolutionOverlay } from '@/components/ui/EvolutionOverlay'
import type { EvolutionStage } from '@/components/bububu/BububuCharacter'
import { SatiationScreen } from '@/features/feed/SatiationScreen'
import { ShareCard } from '@/features/share/ShareCard'
import { MemoryGame } from '@/features/memory/MemoryGame'
import { getUnlockedPool, getNewlyUnlockedCategories, getTutorialChips } from '@/data/vocabulary/unlockSchedule'
import { QuizOptions } from '@/components/ui/QuizOptions'
import { ALL_WORDS } from '@/data/vocabulary/index'
import type { BubState } from '@/components/bububu/BububuCharacter'
import type { FeedResult, VocabEntry } from '@/types'

// ─── Fome do dia — categoria que o Bububu quer comer hoje ────────────────────
const CRAVING_CATS = ['food', 'actions', 'adjectives', 'time', 'transport', 'animals', 'colors', 'home', 'phrases']

function getDailyCraving(date: string): string {
  const hash = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return CRAVING_CATS[hash % CRAVING_CATS.length]
}

// ─── Quiz pós-feed ────────────────────────────────────────────────────────────
interface QuizState {
  word:          string
  correct:       string
  options:       string[]   // 4 traduções embaralhadas
  sourceEntry:   VocabEntry
}

function buildQuizOptions(entry: VocabEntry, seenIds: string[]): string[] {
  const seenSet = new Set(seenIds)
  // Prefere distratores da mesma categoria já vistos
  const samecat = ALL_WORDS.filter(w =>
    w.id !== entry.id && w.category === entry.category && seenSet.has(w.id)
  )
  const anySeen = ALL_WORDS.filter(w =>
    w.id !== entry.id && seenSet.has(w.id)
  )
  const fallback = ALL_WORDS.filter(w => w.id !== entry.id)
  const pool = samecat.length >= 3 ? samecat : anySeen.length >= 3 ? anySeen : fallback
  const distractors = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(w => w.translation)
  return [...distractors, entry.translation].sort(() => Math.random() - 0.5)
}

interface XpPop { id: number; amount: number; screenX: number; screenY: number; tier: 'normal' | 'bonus' | 'jackpot' }
interface FlyingData { word: string; startX: number; startY: number; endX: number; endY: number }

// Boca aberta: cx=60, cy=80 em viewBox 0 0 120 140, SVG 140×160px
const MOUTH_OFFSET_X = (60 / 120) * 140   // = 70px do left do SVG
const MOUTH_OFFSET_Y = (80 / 140) * 160   // ≈ 91px do top do SVG

function getRandomChips(count: number, pool: VocabEntry[], excludeIds: string[] = []): VocabEntry[] {
  const source = pool.filter(w => !excludeIds.includes(w.id))
  const from   = source.length >= count ? source : pool
  return [...from].sort(() => Math.random() - 0.5).slice(0, count)
}

// Chip orquestrado: tenta sempre entregar algo com potencial de combo
function getSmartChipReplacement(
  pool: VocabEntry[],
  excludeIds: string[],
  lastFed: VocabEntry,
  nextKonamiStep: number,
): VocabEntry | null {
  const available = pool.filter(w => !excludeIds.includes(w.id))
  if (!available.length) return null

  // P1: próxima palavra da sequência Konami (aparece sempre que o jogador está no meio dela)
  if (nextKonamiStep > 0 && nextKonamiStep < KONAMI_SEQUENCE.length) {
    const match = available.find(w => w.word.toLowerCase() === KONAMI_SEQUENCE[nextKonamiStep])
    if (match) return match
  }

  // P2: oposto da última palavra → facilita VS
  const oppositeWord = OPPOSITE_PAIRS[lastFed.word.toLowerCase()]
  if (oppositeWord) {
    const opp = available.find(w => w.word.toLowerCase() === oppositeWord)
    if (opp) return opp
  }

  // P3: mesma categoria (22% de chance) → possibilita Trio sem entregá-lo de graça
  if (Math.random() < 0.22) {
    const sameCat = available.filter(w => w.category === lastFed.category)
    if (sameCat.length > 0) return sameCat[Math.floor(Math.random() * sameCat.length)]
  }

  // Fallback: aleatório
  return available[Math.floor(Math.random() * available.length)]
}

function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

const KONAMI_SEQUENCE = ['sleep', 'morning', 'coffee', 'work', 'happy']

const HOLD_DURATION = 3000          // ms para carregar o bullet time

// ─────────────────────────────────────────────────────────────────────────────
//  SEQUÊNCIA SONORA (todos os delays são relativos ao tap = t0)
//
//  t0  +   0ms  → playWhoosh()            chip começa a voar
//  t0  + 380ms  → chip na boca            playSnap() + setBubState('eating')
//  t0  + 380ms  → playMunch()             3 crunches em 0, 333, 666ms
//  t0  +1380ms  → setResult() + 💩        playFart()
//  t0  +1780ms  → speakBububu()           Bububu satisfeito
//  t0  +2280ms  → triggerXpPop + coin     recompensa final
//
// ─────────────────────────────────────────────────────────────────────────────

interface FeedScreenProps {
  onResetToOnboarding?: () => void
}

export function FeedScreen({ onResetToOnboarding }: FeedScreenProps = {}) {
  const { feedWord }                                           = useFeed()
  const { speakWord }                                          = useAudio()
  const { progress, computedLevel, levelProgress, dailyLimit, recordWord, setMode, setDifficulty, resetProgress, wordsUntilNextStage } = useProgress()
  const { speakBububu, speakBububuBulletTime }                  = useBububuVoice(getStage(computedLevel))
  const [showSettings, setShowSettings] = useState(false)
  const [showShare, setShowShare]         = useState(false)
  const [showProgress, setShowProgress]   = useState(false)
  const [showPhone, setShowPhone]         = useState(false)
  const [phoneBadge, setPhoneBadge]       = useState(() => localStorage.getItem('bub_phone_seen') !== new Date().toISOString().slice(0,10))

  // Pool de vocabulário desbloqueado para o nível atual
  const pool    = useMemo(() => getUnlockedPool(computedLevel, progress.difficulty), [computedLevel, progress.difficulty])
  const poolRef = useRef<VocabEntry[]>(pool)
  useEffect(() => { poolRef.current = pool }, [pool])

  const [chips, setChips] = useState<VocabEntry[]>(() => {
    const initPool = getUnlockedPool(computedLevel, progress.difficulty)
    // Tutorial: primeira sessão → banana, juice, milk (Trio garantido) + sleep (semente do Konami)
    if (progress.wordsLearned.length === 0) {
      const tutorial = getTutorialChips(initPool)
      if (tutorial) {
        const tutorialIds = tutorial.map(t => t.id)
        const sleepChip = initPool.find(w => w.word.toLowerCase() === 'sleep' && !tutorialIds.includes(w.id))
        const fourth = sleepChip ?? getRandomChips(1, initPool, tutorialIds)[0]
        return fourth ? [...tutorial, fourth] : tutorial
      }
    }
    return getRandomChips(4, initPool)
  })
  const [flying, setFlying]       = useState<FlyingData | null>(null)
  const [flyingId, setFlyingId]   = useState<string | null>(null)
  const [result, setResult]       = useState<FeedResult | null>(null)
  const [bubState, setBubState]   = useState<BubState>('idle')
  const [isReview, setIsReview]   = useState(false)
  const [xpPops, setXpPops]       = useState<XpPop[]>([])
  const [munchText, setMunchText] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ level: number; newCats: string[] } | null>(null)
  const [poopHint, setPoopHint]         = useState(false)
  const [isBurp, setIsBurp]             = useState(false)
  const [showSatiation,  setShowSatiation]  = useState(false)
  const [showMemory,     setShowMemory]     = useState(false)
  const [memoryFromSat,  setMemoryFromSat]  = useState(false)  // veio da SatiationScreen?
  const [forceAwake,     setForceAwake]     = useState(false)
  const [overLimit, setOverLimit]         = useState(false)
  const [quizState,       setQuizState]       = useState<QuizState | null>(null)
  const [quizResult,      setQuizResult]      = useState<'correct' | 'wrong' | null>(null)
  const [quizSelectedIdx, setQuizSelectedIdx] = useState<number | null>(null)
  const quizTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [showPoop, setShowPoop]         = useState(false)
  const [poopFixed, setPoopFixed]       = useState<{x:number,fromY:number,dropPx:number}|null>(null)
  const [poopSplat, setPoopSplat]         = useState(false)
  const splatTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const bubContainerRef  = useRef<HTMLDivElement>(null)
  const resultZoneRef    = useRef<HTMLDivElement>(null)
  const poopTimerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const clearTimerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hintTimerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const popId            = useRef(0)
  const feeding          = useRef(false)
  const prevLevel        = useRef(computedLevel)
  const lastFedWords     = useRef<VocabEntry[]>([])
  const konamiProgress   = useRef(0)
  const chipsRef         = useRef<VocabEntry[]>([])
  // Cooldown: impede Trio/VS de disparar de novo em menos de 10 feeds
  const feedsSinceCombo  = useRef(0)

  const [superPeido,    setSuperPeido]    = useState(false)
  const [presentWaiting, setPresentWaiting] = useState(false)
  const [presentOpening, setPresentOpening] = useState(false)
  const presentResolveRef = useRef<(() => void) | null>(null)
  const [evolutionStage, setEvolutionStage] = useState<EvolutionStage | null>(null)
  const prevStageRef = useRef<EvolutionStage>(getStage(computedLevel))
  const [streakToast,   setStreakToast]   = useState(false)
  const [activeCombo,   setActiveCombo]   = useState<ComboData | null>(null)
  const [hintIds,       setHintIds]       = useState<Set<string>>(new Set())
  const [konamiHintId,  setKonamiHintId]  = useState<string | null>(null)
  const [masteryWord,   setMasteryWord]   = useState<string | null>(null)
  const [justMastered,  setJustMastered]  = useState(false)
  const [bubSpeech,     setBubSpeech]     = useState<string | null>(null)
  const [bursts,        setBursts]        = useState<BurstData[]>([])
  const [screenFlash,   setScreenFlash]   = useState<string | null>(null)
  const [jackpotKey,    setJackpotKey]    = useState(0)
  const [shakeKey,      setShakeKey]      = useState(0)
  const [confettiActive, setConfettiActive] = useState(false)
  const [shakeActive,   setShakeActive]   = useState(false)
  const [newChipId,     setNewChipId]     = useState<string | null>(null)
  const shakeTimerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const newChipTimer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const burstId = useRef(0)
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // ── Easter egg: segura o Bububu ──────────────────────────────────────────────
  const holdStartRef  = useRef<number | null>(null)
  const holdRafRef    = useRef<number | null>(null)
  const [bulletTimeWord,  setBulletTimeWord]  = useState<string | null>(null)
  const [bulletTimePhase, setBulletTimePhase] = useState<'off' | 'fly' | 'impact'>('off')

  // Mostra uma fala do Bububu por `duration` ms, depois limpa
  const handlePresentTap = useCallback(() => {
    if (!presentResolveRef.current || presentOpening) return
    playPresentPop()
    hapticPresentPop()
    setScreenFlash('rgba(255,255,255,0.7)')
    setTimeout(() => setScreenFlash(null), 180)
    setPresentOpening(true)
    setTimeout(() => {
      setPresentOpening(false)
      if (presentResolveRef.current) {
        presentResolveRef.current()
        presentResolveRef.current = null
      }
    }, 380)
  }, [presentOpening])

  const showSpeech = useCallback((text: string, duration = 2900) => {
    clearTimeout(speechTimerRef.current)
    setBubSpeech(text)
    speechTimerRef.current = setTimeout(() => setBubSpeech(null), duration)
  }, [])

  // ── Easter egg: refs de função — reatribuídas a cada render para capturar estado atual
  const tickHoldRef         = useRef<() => void>(() => {})
  const fireBulletTimeRef   = useRef<() => void>(() => {})
  const suppressNextTapRef  = useRef(false)

  fireBulletTimeRef.current = () => {
    cancelAnimationFrame(holdRafRef.current ?? 0)
    holdStartRef.current = null
    // bloqueia o click que o browser vai gerar quando o dedo soltar
    suppressNextTapRef.current = true
    setTimeout(() => { suppressNextTapRef.current = false }, 600)
    const word = result?.entry.word ?? lastFedWords.current.at(-1)?.word ?? 'bububu'
    setBulletTimeWord(word.toUpperCase())
    setBulletTimePhase('fly')
    setScreenFlash('#ffffff')
    setTimeout(() => setScreenFlash(null), 60)
    setTimeout(() => showSpeech(getBubPhrase('bullet_time'), 3500), 2800)
    setTimeout(() => {
      const mouth = getMouthPos()
      triggerXpPop(15, mouth.x, mouth.y - 60, 'bonus')
    }, 3200)
    setTimeout(() => { setBulletTimePhase('impact'); speakBububuBulletTime() }, 2600)
    setTimeout(() => { setBulletTimePhase('off'); setBulletTimeWord(null) }, 4200)
  }

  tickHoldRef.current = () => {
    if (!holdStartRef.current) return
    const p = Math.min(1, (Date.now() - holdStartRef.current) / HOLD_DURATION)
    if (p >= 1) { fireBulletTimeRef.current(); return }
    holdRafRef.current = requestAnimationFrame(tickHoldRef.current)
  }

  function handleBubHoldStart() {
    if (feeding.current || holdStartRef.current !== null || bulletTimePhase !== 'off') return
    holdStartRef.current = Date.now()
    holdRafRef.current = requestAnimationFrame(tickHoldRef.current)
  }

  function handleBubHoldEnd() {
    if (holdStartRef.current === null) return
    cancelAnimationFrame(holdRafRef.current ?? 0)
    holdStartRef.current = null
  }

  // Shake: ativa por 420ms cada vez que shakeKey sobe
  useEffect(() => {
    if (shakeKey === 0) return
    clearTimeout(shakeTimerRef.current)
    setShakeActive(true)
    shakeTimerRef.current = setTimeout(() => setShakeActive(false), 420)
    return () => clearTimeout(shakeTimerRef.current)
  }, [shakeKey])

  // Preload do peido jackpot via ElevenLabs (faz uma só vez no mount)
  useEffect(() => { void preloadJackpotFart() }, [])

  // Detecta mudança de estágio de evolução durante a sessão
  useEffect(() => {
    const newStage = getStage(computedLevel)
    if (newStage !== prevStageRef.current) {
      setEvolutionStage(newStage)
      prevStageRef.current = newStage
    }
  }, [computedLevel])

  // Fome na abertura — se não alimentou nada hoje, Bububu pede logo
  useEffect(() => {
    if ((progress.wordsToday ?? 0) === 0) {
      const t = setTimeout(() => {
        if (!feeding.current) showSpeech(getBubPhrase('idle_hungry'), 3500)
      }, 1400)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toast de streak — aparece uma vez por dia se streak ≥ 2
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if ((progress.streak ?? 0) < 2) return
    if (localStorage.getItem('bub_streak_toast') === today) return
    const t = setTimeout(() => {
      setStreakToast(true)
      localStorage.setItem('bub_streak_toast', today)
      setTimeout(() => setStreakToast(false), 3000)
    }, 1800)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sets derivados do progresso — para indicadores nos chips
  const reviewIds   = useMemo(() => new Set(
    progress.wordsLearned.filter(id => !progress.masteredWords.includes(id))
  ), [progress.wordsLearned, progress.masteredWords])

  const masteredIds = useMemo(() => new Set(progress.masteredWords), [progress.masteredWords])

  // Calculate fixed-position poop drop when showPoop triggers
  useEffect(() => {
    if (!showPoop) { setPoopFixed(null); return }
    const bubRect    = bubContainerRef.current?.getBoundingClientRect()
    const resultRect = resultZoneRef.current?.getBoundingClientRect()
    if (!bubRect || !resultRect) return
    // Bum: center of bub zone + 80px (half of 160px character height)
    const fromY  = bubRect.top  + bubRect.height / 2 + 80
    // Queda vertical reta — pousa logo acima da linha da palavra
    const toY    = resultRect.top - 22
    const fromX  = bubRect.left + bubRect.width / 2
    setPoopFixed({ x: fromX, fromY, dropPx: toY - fromY })
    // Splat no impacto (750ms = duração da queda)
    clearTimeout(splatTimerRef.current)
    splatTimerRef.current = setTimeout(() => {
      setPoopSplat(true)
      setTimeout(() => setPoopSplat(false), 700)
    }, 750)
  }, [showPoop])


  useEffect(() => {
    if (computedLevel > prevLevel.current) {
      const newCats = getNewlyUnlockedCategories(prevLevel.current, computedLevel)
      prevLevel.current = computedLevel
      setLevelUpData({ level: computedLevel, newCats })
      // frase de evolução está dentro do EvolutionOverlay
    }
  }, [computedLevel, showSpeech])

  // Mantém ref de chips sempre atualizada
  useEffect(() => { chipsRef.current = chips }, [chips])

  // Pensamentos espontâneos — primeiro em 12s, depois a cada 75-120s
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    function scheduleThou(delay: number) {
      t = setTimeout(() => {
        if (!feeding.current) showSpeech(getBubPhrase('thought', undefined, undefined, undefined, progress.userName), 3200)
        scheduleThou(Math.round((75 + Math.random() * 45) * 1000))
      }, delay)
    }
    scheduleThou(12_000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sino da Igreja — reage às :00 e :30 de cada hora
  useEffect(() => {
    function scheduleNextSino() {
      const now = new Date()
      const min = now.getMinutes()
      const sec = now.getSeconds()
      const msUntilNext = min < 30
        ? ((30 - min) * 60 - sec) * 1000
        : ((60 - min) * 60 - sec) * 1000
      return setTimeout(() => {
        if (!feeding.current) showSpeech(getBubPhrase('sino', undefined, undefined, undefined, progress.userName), 3800)
        timerRef.current = scheduleNextSino()
      }, msUntilNext)
    }
    const timerRef = { current: scheduleNextSino() }
    return () => clearTimeout(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { isSleeping, hoursHungry } = usePetState(progress.mode, progress.lastFedAt)

  // Fala de fome — dispara quando muda para estado faminto
  const prevHungryRef = useRef(false)
  useEffect(() => {
    const isHungry = hoursHungry >= 12
    if (isHungry && !prevHungryRef.current && !feeding.current) {
      setTimeout(() => showSpeech(getBubPhrase('idle_hungry'), 3200), 1500)
    } else if (hoursHungry >= 2 && !prevHungryRef.current && !feeding.current) {
      setTimeout(() => showSpeech(getBubPhrase('idle_normal'), 2800), 2000)
    }
    prevHungryRef.current = isHungry
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoursHungry])

  // Hint system — 4s idle → pulsa chips com combo potencial
  useEffect(() => {
    clearTimeout(hintTimerRef.current)
    setHintIds(new Set())
    setKonamiHintId(null)

    hintTimerRef.current = setTimeout(() => {
      if (feeding.current) return
      const current = chipsRef.current
      const hints = new Set<string>()
      let konami: string | null = null

      // VS hint: par de opostos entre os chips
      for (let i = 0; i < current.length; i++) {
        for (let j = i + 1; j < current.length; j++) {
          const w1 = current[i].word.toLowerCase()
          const w2 = current[j].word.toLowerCase()
          if (OPPOSITE_PAIRS[w1] === w2 || OPPOSITE_PAIRS[w2] === w1) {
            hints.add(current[i].id)
            hints.add(current[j].id)
          }
        }
      }

      // Trio hint: 2+ chips da mesma categoria
      const byCat: Record<string, string[]> = {}
      current.forEach(c => {
        byCat[c.category] = byCat[c.category] ?? []
        byCat[c.category].push(c.id)
      })
      Object.values(byCat).forEach(ids => {
        if (ids.length >= 2) ids.forEach(id => hints.add(id))
      })

      // Konami hint sutil: ✨ na próxima palavra da sequência (se em progresso)
      if (konamiProgress.current > 0) {
        const nextWord = KONAMI_SEQUENCE[konamiProgress.current]
        const match = current.find(c => c.word.toLowerCase() === nextWord)
        if (match) konami = match.id
      }

      setHintIds(hints)
      setKonamiHintId(konami)
    }, 4000)

    return () => clearTimeout(hintTimerRef.current)
  }, [chips])

  function getMouthPos(): { x: number; y: number } {
    const c = bubContainerRef.current
    if (!c) return { x: window.innerWidth / 2, y: 150 }
    const r = c.getBoundingClientRect()
    // SVG centralizado horizontalmente no container; padding-top 8px
    return {
      x: r.left + (r.width - 140) / 2 + MOUTH_OFFSET_X,
      y: r.top  + 8                    + MOUTH_OFFSET_Y,
    }
  }

  function triggerXpPop(amount: number, screenX: number, screenY: number, tier: 'normal' | 'bonus' | 'jackpot' = 'normal') {
    const id = ++popId.current
    setXpPops(prev => [...prev, { id, amount, screenX, screenY, tier }])
    const dur = tier === 'jackpot' ? 1300 : 1050
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), dur)
  }

  const handleChipSelect = useCallback(async (entry: VocabEntry, rect: DOMRect) => {
    if (feeding.current) return
    feeding.current = true

    // Limpa hints imediatamente ao tocar
    clearTimeout(hintTimerRef.current)
    setHintIds(new Set())
    setKonamiHintId(null)

    const mouth = getMouthPos()

    // ── t0: tap — burst de partículas na posição do chip ────────────────────
    const chipCx = rect.left + rect.width  / 2
    const chipCy = rect.top  + rect.height / 2
    // Guarda posição para o XP pop aparecer no mesmo lugar
    const chipPopX = chipCx
    const chipPopY = rect.top - 8
    const chipCol = getCategoryColor(entry.category)
    const newBurstId = ++burstId.current
    setBursts(prev => [...prev, { id: newBurstId, x: chipCx, y: chipCy, color: chipCol.bg, ring: chipCol.ring }])

    playWhoosh()                       // som do voo
    setFlyingId(entry.id)
    setResult(null)
    setFlying({
      word:   entry.word,
      startX: rect.left + rect.width  / 2,
      startY: rect.top  + rect.height / 2,
      endX:   mouth.x,
      endY:   mouth.y,
    })

    // Busca o resultado em paralelo com a animação
    const { isNew, wordsToday: todayCount, justSatiated, overLimit: isOver, justMastered: isMastered } = recordWord(entry)
    setIsReview(!isNew)
    setOverLimit(isOver)
    setJustMastered(isMastered)
    const feedResultPromise = feedWord(entry)

    // ── t0 + 380ms: chip na boca ─────────────────────────────────────────────
    await delay(380)
    setFlying(null)
    playSnap()                         // batida de entrada
    setBubState('eating')
    setMunchText(true)
    playMunch()                        // 3 crunches em 0, 333, 666ms

    // ── t0 + 1380ms: mastigação concluída → 💩 ───────────────────────────────
    await delay(1000)
    setMunchText(false)
    const feedResult = await feedResultPromise

    setBubState('pooping')   // expressão de esforço durante a cagada
    setTimeout(() => setBubState('idle'), 950)

    if (feedResult.rewardTier === 'jackpot') {
      playFartJackpot()      // reward-jackpot.wav → ElevenLabs → mega synth
      playBububuSuper()      // bububu-super.wav (triplicado)
      setSuperPeido(true)    // overlay SUPER PEIDO
      setIsBurp(false)
    } else if (feedResult.rewardTier === 'context_bonus') {
      playFartBonus()        // reward-bonus.wav com variação de pitch
      setIsBurp(false)
    } else {
      const soundType = playFart()
      setIsBurp(soundType === 'burp')
    }

    // Presente desliza até embaixo e fica pulsando aguardando tap
    clearTimeout(poopTimerRef.current)
    clearTimeout(clearTimerRef.current)
    clearTimeout(quizTimerRef.current)
    setShowPoop(true)
    poopTimerRef.current = setTimeout(() => {
      setShowPoop(false)
      setPresentWaiting(true)
    }, 950)

    // Aguarda tap do usuário (auto-abre após 12s para não travar)
    await new Promise<void>(resolve => {
      presentResolveRef.current = resolve
      setTimeout(resolve, 12000)
    })
    setPresentWaiting(false)
    setResult(feedResult)

    // ── Quiz pós-feed: só para palavras novas e não-frases ────────────────────
    const shouldQuiz = isNew && !entry.word.includes(' ') && !isOver
    if (shouldQuiz) {
      setQuizState({
        word:        entry.word,
        correct:     entry.translation,
        options:     buildQuizOptions(entry, progress.wordsLearned),
        sourceEntry: entry,
      })
      setQuizResult(null)
      setQuizSelectedIdx(null)
      // Resultado some após quiz (quiz tem 1.3s pós-resposta, mais 4s de janela)
      clearTimerRef.current = setTimeout(() => {
        setResult(null)
        setIsBurp(false)
        setQuizState(null)
        setQuizResult(null)
        setQuizSelectedIdx(null)
      }, 7500)
    } else {
      clearTimerRef.current = setTimeout(() => {
        setResult(null)
        setIsBurp(false)
      }, 8000)
    }

    // Hint one-time
    if (!localStorage.getItem('bub_poop_hint')) {
      localStorage.setItem('bub_poop_hint', '1')
      setPoopHint(true)
      setTimeout(() => setPoopHint(false), 2800)
    }

    // ── Fala do Bububu — aparece logo após o reveal ──────────────────────────
    setTimeout(() => {
      if (!isNew) {
        showSpeech(getBubPhrase('eat_review'))
      } else if (feedResult.rewardTier === 'jackpot') {
        showSpeech(getBubPhrase('eat_jackpot'))
      } else if (feedResult.rewardTier === 'context_bonus') {
        showSpeech(getBubPhrase('eat_context'))
      } else {
        showSpeech(getBubPhrase('eat_normal', entry.word, undefined, entry.category))
      }
    }, 220)

    // ── Rachel fala a palavra → Bububu reage depois ───────────────────────────
    await delay(300)                        // pausa: usuário lê o card
    await speakWord(feedResult.entry.word)  // ElevenLabs — awaited, sem sobreposição
    speakBububu()                           // "bububu!" só após Rachel terminar

    // ── recompensa ────────────────────────────────────────────────────────────
    await delay(300)
    if (isNew) {
      if (feedResult.rewardTier === 'jackpot') {
        playCoinJackpot()
        hapticJackpot()
        setScreenFlash('#fbbf24')
        setJackpotKey(k => k + 1)
        setShakeKey(k => k + 1)
        setConfettiActive(true)
        setTimeout(() => setScreenFlash(null), 500)
        setTimeout(() => setConfettiActive(false), 2600)
        triggerXpPop(isOver ? Math.ceil(feedResult.xpGained / 2) : feedResult.xpGained, chipPopX, chipPopY, 'jackpot')
      } else if (feedResult.rewardTier === 'context_bonus') {
        playCoinBonus()
        hapticBonus()
        setScreenFlash(getCategoryColor(entry.category).ring)
        setTimeout(() => setScreenFlash(null), 380)
        triggerXpPop(isOver ? Math.ceil(feedResult.xpGained / 2) : feedResult.xpGained, chipPopX, chipPopY, 'bonus')
      } else {
        playCoinNormal()
        triggerXpPop(isOver ? Math.ceil(feedResult.xpGained / 2) : feedResult.xpGained, chipPopX, chipPopY, 'normal')
      }
    }

    // ── Fome do dia: reação especial + XP bônus extra ────────────────────────
    if (entry.category === cravingCategory && !isOver) {
      setTimeout(() => showSpeech(getBubPhrase('eat_craving'), 2800), 300)
      setTimeout(() => triggerXpPop(3, chipPopX, chipPopY, 'bonus'), 2400)
    }

    // Mastery toast — aparece 400ms após o reveal para não colidir com o 💩
    if (isMastered) {
      setTimeout(() => {
        setMasteryWord(entry.word)
        showSpeech(getBubPhrase('mastery', entry.word, undefined, entry.category), 3200)
      }, 400)
    }

    setBubState(
      !isNew || feedResult.rewardTier === 'normal' ? 'idle' : 'celebrating'
    )

    // ── Pre-calcula próximo passo do Konami para orquestração do chip ────────
    const w = entry.word.toLowerCase()
    let nextKonamiStep: number
    if (w === KONAMI_SEQUENCE[konamiProgress.current]) {
      const adv = konamiProgress.current + 1
      nextKonamiStep = adv >= KONAMI_SEQUENCE.length ? 0 : adv
    } else {
      nextKonamiStep = w === KONAMI_SEQUENCE[0] ? 1 : 0
    }

    // ── t0 + 2880ms: reabastece chip (seleção inteligente) ───────────────────
    await delay(600)
    setFlyingId(null)
    setChips(prev => {
      const remaining = prev.filter(c => c.id !== entry.id)
      const exclude   = [...remaining.map(c => c.id), entry.id]
      const smart = getSmartChipReplacement(poolRef.current, exclude, entry, nextKonamiStep)
      if (smart) {
        clearTimeout(newChipTimer.current)
        setNewChipId(smart.id)
        newChipTimer.current = setTimeout(() => setNewChipId(null), 650)
      }
      return smart ? [...remaining, smart] : remaining
    })
    setBubState('idle')
    feeding.current = false

    // ── Combo detection ───────────────────────────────────────────────────────
    lastFedWords.current = [...lastFedWords.current, entry].slice(-5)
    feedsSinceCombo.current++

    const COMBO_COOLDOWN = 10   // feeds mínimos entre dois combos Trio/VS
    let comboFired = false

    // 1. Konami (highest priority, sem cooldown — é raro por design)
    if (w === KONAMI_SEQUENCE[konamiProgress.current]) {
      konamiProgress.current++
      if (konamiProgress.current === KONAMI_SEQUENCE.length) {
        konamiProgress.current = 0
        lastFedWords.current = []
        feedsSinceCombo.current = 0
        playKonami()
        hapticKonami()
        showSpeech(getBubPhrase('combo_konami'), 4000)
        setActiveCombo({ type: 'konami', words: [...KONAMI_SEQUENCE] })
        comboFired = true
      }
    } else {
      konamiProgress.current = w === KONAMI_SEQUENCE[0] ? 1 : 0
    }

    // 2. Opposites VS — cooldown garante que não spame
    if (!comboFired && feedsSinceCombo.current >= COMBO_COOLDOWN && lastFedWords.current.length >= 2) {
      const prevEntry = lastFedWords.current[lastFedWords.current.length - 2]
      if (OPPOSITE_PAIRS[w] === prevEntry.word.toLowerCase()) {
        lastFedWords.current = []
        feedsSinceCombo.current = 0
        playComboVS()
        hapticCombo()
        showSpeech(getBubPhrase('combo_vs'), 3000)
        setActiveCombo({ type: 'versus', words: [prevEntry.word, entry.word] })
        setShakeKey(k => k + 1)
        comboFired = true
      }
    }

    // 3. Semantic Trio — 3 seguidas da mesma categoria + cooldown
    if (!comboFired && feedsSinceCombo.current >= COMBO_COOLDOWN && lastFedWords.current.length >= 3) {
      const last3 = lastFedWords.current.slice(-3)
      if (last3.every(e2 => e2.category === last3[0].category)) {
        lastFedWords.current = []
        feedsSinceCombo.current = 0
        playComboTrio()
        hapticCombo()
        showSpeech(getBubPhrase('combo_trio'), 3000)
        setActiveCombo({
          type: 'trio',
          words: last3.map(e2 => e2.word),
          category: last3[0].category,
        })
        setShakeKey(k => k + 1)
      }
    }

    // ── Escassez: Bububu avisa quando o estoque do dia está acabando ────────
    if (!justSatiated && !isOver) {
      const remaining = dailyLimit - todayCount
      if (remaining === 3) {
        setTimeout(() => showSpeech('Ainda estou com fome! Só mais 3... 🍱', 2500), 600)
      } else if (remaining === 1) {
        setTimeout(() => showSpeech('Última mordida do dia! Faz valer! 🎯', 2500), 600)
      }
    }

    // ── Saciedade: mostra tela após animação completa ─────────────────────────
    if (justSatiated) {
      await delay(800)
      setShowSatiation(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedWord, speakBububu, speakWord, recordWord, dailyLimit, showSpeech])

  const handleQuizAnswer = useCallback((correct: boolean, idx: number) => {
    setQuizSelectedIdx(idx)
    setQuizResult(correct ? 'correct' : 'wrong')
    if (correct) {
      showSpeech(getBubPhrase('eat_normal'), 2000)
    } else {
      showSpeech(`É "${quizState?.correct}" 😅`, 2200)
    }
    // Auto-avança após 1.3s
    clearTimeout(quizTimerRef.current)
    quizTimerRef.current = setTimeout(() => {
      setQuizState(null)
      setQuizResult(null)
      setQuizSelectedIdx(null)
      setResult(null)
      setIsBurp(false)
    }, 1300)
  }, [quizState, showSpeech])

  const theme     = useTheme()
  const isKids    = theme.isKids

  const {
    activeWorld,
    unlockedWorlds,
    setWorld,
    newlyUnlocked,
    dismissNewlyUnlocked,
  } = useKidsWorld(computedLevel, isKids)
  const wordCount = progress.wordsLearned.length
  const streak    = progress.streak
  const isFeeding = flyingId !== null

  // Mapeia fome → visual do Bububu quando idle
  const idleMood = (): BubState => {
    if (forceAwake && isSleeping) return 'yawning'
    if (hoursHungry >= 12) return 'sad'
    return 'idle'
  }

  const activeBubState: BubState = bubState !== 'idle' ? bubState : idleMood()
  const isHungryIdle = (progress.wordsToday === 0 || hoursHungry >= 2) && bubState === 'idle'

  if (isSleeping && !forceAwake) {
    return (
      <SleepScreen
        mode={progress.mode}
        onModeChange={setMode}
        onWake={() => setForceAwake(true)}
      />
    )
  }

  if (showMemory) {
    return (
      <MemoryGame
        mode={progress.mode}
        wordsLearned={progress.wordsLearned}
        onDone={() => {
          setShowMemory(false)
          if (memoryFromSat) { setShowSatiation(true); setMemoryFromSat(false) }
        }}
      />
    )
  }

  if (showSatiation) {
    return (
      <SatiationScreen
        mode={progress.mode}
        wordsToday={progress.wordsToday}
        streak={progress.streak}
        userName={progress.userName}
        onContinue={() => { setShowSatiation(false); setOverLimit(true) }}
        onPlayMemory={progress.wordsLearned.length >= 2
          ? () => { setShowSatiation(false); setMemoryFromSat(true); setShowMemory(true) }
          : undefined
        }
      />
    )
  }

  // Fome do dia — determinística pela data
  const todayStr        = new Date().toISOString().slice(0, 10)
  const cravingCategory = getDailyCraving(todayStr)
  const cravingColor    = getCategoryColor(cravingCategory)

  // Indicador de apetite — contador de escassez
  const wordsToday     = progress.wordsToday ?? 0
  const remainingToday = Math.max(0, dailyLimit - wordsToday)
  const appetiteIsLow  = remainingToday <= 3 && remainingToday > 0 && !overLimit
  const appetiteCrit   = remainingToday <= 1 && remainingToday > 0 && !overLimit

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      background: theme.bgGradient,
      animation: shakeActive ? 'screen-shake 0.42s ease-out' : 'none',
    }}>
      <SceneBackground isKids={isKids} worldId={activeWorld} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <XpBar level={computedLevel} progress={levelProgress} wordsUntilNextStage={wordsUntilNextStage} />
      </div>

      {/* Fome do dia + contador de apetite */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 8, padding: '2px 0 0', position: 'relative', zIndex: 1,
      }}>
        {/* Badge de fome do dia */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: `${cravingColor.bg}22`,
          border: `1px solid ${cravingColor.ring}55`,
          borderRadius: 99, padding: '2px 9px 2px 7px',
        }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: cravingColor.ring, letterSpacing: 0.2 }}>
            {cravingColor.label || cravingCategory}
          </span>
        </div>
        {overLimit ? (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: isKids ? '#b45309' : 'rgba(196,181,253,0.55)',
            background: isKids ? 'rgba(180,83,9,0.10)' : 'rgba(196,181,253,0.08)',
            padding: '2px 8px', borderRadius: 99,
          }}>
            ½ XP
          </span>
        ) : remainingToday === 0 ? null : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: appetiteCrit
              ? 'rgba(239,68,68,0.15)'
              : appetiteIsLow
                ? (isKids ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.15)')
                : (isKids ? 'rgba(45,31,107,0.10)' : 'rgba(255,255,255,0.07)'),
            border: `1px solid ${
              appetiteCrit
                ? 'rgba(239,68,68,0.40)'
                : appetiteIsLow
                  ? 'rgba(245,158,11,0.35)'
                  : (isKids ? 'rgba(45,31,107,0.15)' : 'rgba(255,255,255,0.12)')
            }`,
            borderRadius: 99,
            padding: '2px 10px 2px 7px',
            animation: appetiteCrit ? 'hint-ring 1.3s ease-in-out infinite' : undefined,
            ['--chip-ring' as string]: 'rgba(239,68,68,0.6)',
            ['--chip-shadow' as string]: 'none',
          } as React.CSSProperties}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>🍱</span>
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: 0.2,
              color: appetiteCrit
                ? '#ef4444'
                : appetiteIsLow
                  ? '#f59e0b'
                  : (isKids ? 'rgba(45,31,107,0.55)' : 'rgba(255,255,255,0.55)'),
            }}>
              {remainingToday} {remainingToday === 1 ? 'restante' : 'restantes'}
            </span>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center',
        fontSize: 13, color: isKids ? 'rgba(45,31,107,0.75)' : 'rgba(255,255,255,0.80)', padding: '2px 0 0',
        position: 'relative', zIndex: 1, fontWeight: isKids ? 700 : 400,
      }}>
        <span
          onClick={() => { if (progress.wordsLearned.length >= 2) setShowMemory(true) }}
          style={{
            cursor: progress.wordsLearned.length >= 2 ? 'pointer' : 'default',
            padding: '2px 6px', borderRadius: 8,
            transition: 'background 0.15s',
          }}
          title="Revisar palavras"
        >📚 {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}</span>
        {streak > 0 && <span>🔥 {streak} {streak === 1 ? 'dia' : 'dias'}</span>}

        {/* Alavanca de mundos — só Kids, só se tiver ≥1 mundo desbloqueado além do 1 */}
        {isKids && unlockedWorlds.length > 1 && (
          <WorldSwitcher
            activeWorld={activeWorld}
            unlockedWorlds={unlockedWorlds}
            onSwitch={setWorld}
          />
        )}

        {/* Botão celular — abre o BububuPhone */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowPhone(true); const d = new Date().toISOString().slice(0,10); localStorage.setItem('bub_phone_seen', d); setPhoneBadge(false) }}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              border: `1px solid ${isKids ? 'rgba(45,31,107,0.20)' : 'rgba(255,255,255,0.18)'}`,
              background: isKids ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.07)',
              color: isKids ? 'rgba(45,31,107,0.60)' : 'rgba(255,255,255,0.45)',
              fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
            title="Mensagens do Bububu"
          >
            📱
          </button>
          {/* Badge de notificação — some depois de abrir hoje */}
          {phoneBadge && (
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8, borderRadius: '50%',
              background: '#f87171',
              border: '1.5px solid rgba(10,4,30,0.9)',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Botão compartilhar */}
        <button
          onClick={() => setShowShare(true)}
          style={{
            width: 26, height: 26, borderRadius: '50%',
            border: `1px solid ${isKids ? 'rgba(45,31,107,0.20)' : 'rgba(255,255,255,0.18)'}`,
            background: isKids ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.07)',
            color: isKids ? 'rgba(45,31,107,0.60)' : 'rgba(255,255,255,0.45)',
            fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
          title="Compartilhar progresso"
        >
          📤
        </button>

        {/* Botão de configurações */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              border: `1px solid ${isKids ? 'rgba(45,31,107,0.20)' : 'rgba(255,255,255,0.18)'}`,
              background: isKids ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.07)',
              color: isKids ? 'rgba(45,31,107,0.60)' : 'rgba(255,255,255,0.45)',
              fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
          >
            ⚙️
          </button>

        </div>
      </div>

      <div
        ref={bubContainerRef}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          minHeight: 0,
        }}
      >
        <BububuSpeech text={bubSpeech} isKids={isKids} />

        {/* Botão de pronúncia — cartoon, grande, animado */}
        {result && !isFeeding && (
          <div style={{
            position: 'absolute',
            top: '6%',
            left: 'calc(50% - 108px)',
            zIndex: 6,
          }}>
            {/* Anel pulsante */}
            <div style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: `3px solid ${isKids ? 'rgba(255,180,0,0.60)' : 'rgba(167,139,250,0.55)'}`,
              animation: 'play-ring-expand 1.6s ease-out infinite',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: `3px solid ${isKids ? 'rgba(255,180,0,0.35)' : 'rgba(167,139,250,0.30)'}`,
              animation: 'play-ring-expand 1.6s ease-out 0.55s infinite',
              pointerEvents: 'none',
            }} />

            <button
              onClick={() => speakWord(result.entry.word)}
              aria-label={`Ouvir pronúncia de ${result.entry.word}`}
              style={{
                width: 58, height: 58,
                borderRadius: '50%',
                border: 'none',
                background: isKids
                  ? 'linear-gradient(135deg, #FFE135 0%, #FF9F43 100%)'
                  : 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                boxShadow: isKids
                  ? '0 4px 18px rgba(255,160,0,0.60), 0 2px 0 rgba(180,90,0,0.25)'
                  : '0 4px 18px rgba(124,58,237,0.60)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'play-btn-bounce 1.6s ease-in-out infinite',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                {/* Corpo do speaker */}
                <path d="M5 11 L5 19 L10 19 L18 25 L18 5 L10 11 Z" fill="white" />
                {/* Onda 1 */}
                <path d="M21 10.5 Q24.5 15 21 19.5" stroke="white" strokeWidth="2.4"
                  strokeLinecap="round" fill="none" />
                {/* Onda 2 */}
                <path d="M23.5 7.5 Q28.5 15 23.5 22.5" stroke="white" strokeWidth="2"
                  strokeLinecap="round" fill="none" opacity="0.65" />
              </svg>
            </button>
          </div>
        )}

        <div
          onPointerDown={handleBubHoldStart}
          onPointerUp={handleBubHoldEnd}
          onPointerLeave={handleBubHoldEnd}
          onPointerCancel={handleBubHoldEnd}
          style={{ position: 'relative', display: 'inline-block', touchAction: 'none' }}
        >
          <BububuCharacter
            state={activeBubState}
            rewardTier={result?.rewardTier}
            level={computedLevel}
            jackpotKey={jackpotKey}
            onTap={() => {
              if (suppressNextTapRef.current) return
              speakBububu()
              if (result) speakWord(result.entry.word)
            }}
            onMegaFart={() => {
              playFart()
              setTimeout(() => playFart(), 400)
              setTimeout(() => playFart(), 900)
            }}
            hungry={isHungryIdle}
          />
        </div>
        {xpPops.map(pop => createPortal(
          <div key={pop.id} style={{
            position: 'fixed',
            left: pop.screenX,
            top:  pop.screenY,
            transform: 'translateX(-50%)',
            fontWeight: 900,
            fontSize: pop.tier === 'jackpot' ? 36 : pop.tier === 'bonus' ? 28 : 22,
            pointerEvents: 'none',
            animation: pop.tier === 'jackpot'
              ? 'xp-pop-jackpot 1.3s ease-out forwards'
              : 'xp-pop 1.05s ease-out forwards',
            whiteSpace: 'nowrap',
            zIndex: 9997,
            color: pop.tier === 'jackpot' ? '#fbbf24'
                 : pop.tier === 'bonus'   ? '#a78bfa'
                 :                          '#e9d5ff',
            textShadow: pop.tier === 'jackpot'
              ? '0 0 20px #f59e0b, 0 2px 0 rgba(0,0,0,0.5)'
              : '0 2px 8px rgba(0,0,0,0.6), 0 1px 0 rgba(0,0,0,0.4)',
            letterSpacing: pop.tier === 'jackpot' ? 1 : 0.5,
          }}>
            {pop.tier === 'jackpot' ? '🎆 ' : pop.tier === 'bonus' ? '✨ ' : ''}
            +{pop.amount} XP
            {pop.tier === 'jackpot' ? ' 🎆' : ''}
          </div>,
          document.body
        ))}
        <FloatingIsland />

        {/* Yum text — via portal para nunca ser cortado pelo overflow do container */}
        {munchText && createPortal(
          <div style={{
            position: 'fixed',
            top: (() => {
              const r = bubContainerRef.current?.getBoundingClientRect()
              return r ? r.top + r.height * 0.48 : '45vh'
            })(),
            left: (() => {
              const r = bubContainerRef.current?.getBoundingClientRect()
              return r ? Math.min(r.left + r.width / 2 + 58, window.innerWidth - 160) : '60%'
            })(),
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.92)',
            color: '#7c3aed',
            fontSize: 15,
            fontWeight: 900,
            padding: '7px 13px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 3px 12px rgba(124,58,237,0.25)',
            animation: 'yum-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            letterSpacing: -0.3,
            zIndex: 1200,
          }}>
            😋 yum yum yum...
            {/* triangulo apontando para a boca */}
            <span style={{
              position: 'absolute',
              left: -7,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '8px solid rgba(255,255,255,0.92)',
            }} />
          </div>,
          document.body
        )}
      </div>


      {/* 💩 animado em position:fixed — cai do bumbum até a result zone */}
      {poopFixed && showPoop && (
        <div style={{
          position: 'fixed',
          left: poopFixed.x,
          top: poopFixed.fromY,
          transform: 'translate(-50%, 0)',
          fontSize: 30,
          zIndex: 300,
          pointerEvents: 'none',
          animation: 'poop-fixed-drop 0.80s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
          ['--poop-drop-y' as string]: `${poopFixed.dropPx}px`,
        } as React.CSSProperties}>
          {isBurp ? '🤢' : '🎁'}
        </div>
      )}


      {/* Splat no impacto */}
      {poopSplat && poopFixed && (
        <div style={{
          position: 'fixed',
          left: poopFixed.x,
          top: poopFixed.fromY + poopFixed.dropPx,
          zIndex: 299,
          pointerEvents: 'none',
        }}>
          {isKids
            ? (isBurp
                ? ['#86efac','#4ade80','#bbf7d0','#6ee7b7','#34d399','#a7f3d0']
                : ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F43']
              ).map((color, i) => (
                <span key={i} style={{
                  position: 'absolute',
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: color,
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
                  animation: `poop-splat-particle 0.65s ease-out forwards`,
                  animationDelay: `${i * 18}ms`,
                  ['--splat-angle' as string]: `${i * 60}deg`,
                } as React.CSSProperties} />
              ))
            : [0,60,120,180,240,300].map((deg, i) => (
                <span key={i} style={{
                  position: 'absolute',
                  fontSize: 14,
                  transform: `translate(-50%, -50%) rotate(${deg}deg)`,
                  animation: `poop-splat-particle 0.65s ease-out forwards`,
                  animationDelay: `${i * 18}ms`,
                  ['--splat-angle' as string]: `${deg}deg`,
                } as React.CSSProperties}>{isBurp ? '🤮' : '💩'}</span>
              ))
          }
        </div>
      )}

      {/* Zona de resultado — cresce com o conteúdo, empurra o Bububu para cima */}
      <div ref={resultZoneRef} style={{
        flexShrink: 0,
        minHeight: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 16px',
        position: 'relative',
        zIndex: 1,
      }}>
        {presentWaiting && !munchText && (
          <div
            onClick={handlePresentTap}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 0 14px',
              cursor: presentOpening ? 'default' : 'pointer',
              userSelect: 'none',
              position: 'relative',
              animation: presentOpening ? undefined : 'present-slide-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Partículas de abertura — 10 emojis voando em todas as direções */}
            {presentOpening && ['🎀','✨','⭐','💫','🌟','🎊','🎉','💥','⚡','🌈'].map((emoji, i) => {
              const angle = (i / 10) * 360 + (i % 2 === 0 ? 9 : -9)
              const rad   = (angle * Math.PI) / 180
              const dist  = 70 + (i % 4) * 22
              return (
                <span key={i} style={{
                  position: 'absolute',
                  fontSize: 22 + (i % 3) * 6,
                  pointerEvents: 'none',
                  zIndex: 10,
                  animation: 'present-particle 0.42s cubic-bezier(0.1,0.8,0.2,1) forwards',
                  ['--px' as string]: `${Math.cos(rad) * dist}px`,
                  ['--py' as string]: `${Math.sin(rad) * dist}px`,
                } as React.CSSProperties}>
                  {emoji}
                </span>
              )
            })}

            <div style={{
              fontSize: 56,
              lineHeight: 1,
              animation: presentOpening
                ? 'present-burst 0.38s cubic-bezier(0.36,0.07,0.19,0.97) forwards'
                : 'present-pulse 0.9s ease-in-out infinite',
              filter: presentOpening
                ? 'drop-shadow(0 0 28px rgba(251,191,36,0.9)) brightness(1.4)'
                : 'drop-shadow(0 0 18px rgba(251,191,36,0.55))',
            }}>
              🎁
            </div>
          </div>
        )}
        {result && !munchText && !presentWaiting && (
          <div style={{
            width: '100%',
            background: theme.resultZoneBg,
            border: theme.resultZoneBorder,
            borderRadius: theme.resultZoneRadius,
            boxShadow: isKids && result ? '0 4px 20px rgba(255,217,61,0.20)' : 'none',
          }}>
            <PoopReveal result={result} isReview={isReview} isBurp={isBurp} isKids={isKids} justMastered={justMastered} />
          </div>
        )}
        {!result && !presentWaiting && !munchText && !isFeeding && (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: isKids ? 'rgba(45,31,107,0.55)' : 'rgba(255,255,255,0.60)',
              fontSize: 14, margin: '0 0 3px', lineHeight: 1.5,
              fontWeight: isKids ? 700 : 400,
            }}>
              {isKids ? 'Dá uma palavra pro Bububu! 🍭' : 'Dá uma palavra pro Bububu... 👀'}
            </p>
            <p style={{
              color: isKids ? 'rgba(45,31,107,0.32)' : 'rgba(255,255,255,0.28)',
              fontSize: 12, margin: 0, lineHeight: 1.4,
              fontWeight: 400,
            }}>
              {isKids
                ? 'ele come em inglês e transforma em português'
                : 'ele come em inglês, digere, e entrega em português'}
            </p>
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0,
        padding: '8px 16px 20px',
        background: isKids ? 'rgba(255,255,255,0.70)' : 'rgba(15,5,40,0.75)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: isKids ? '2px solid rgba(255,217,61,0.40)' : '1px solid rgba(196,132,252,0.30)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        {/* ── Quiz pós-feed ── */}
        {quizState ? (
          <QuizOptions
            word={quizState.word}
            options={quizState.options}
            correctAnswer={quizState.correct}
            selectedIdx={quizSelectedIdx}
            result={quizResult}
            onAnswer={handleQuizAnswer}
            isKids={isKids}
          />
        ) : (
          <>
            <p style={{
              fontSize: 11, margin: 0,
              letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800,
              color: isKids ? 'rgba(45,31,107,0.55)' : 'rgba(233,213,255,0.70)',
            }}>
              {isKids ? '🍭 Escolha uma palavra' : 'Escolha uma palavra'}
            </p>

            <WordChips
              chips={chips}
              onSelect={handleChipSelect}
              disabled={isFeeding}
              flyingId={flyingId}
              isKids={isKids}
              hintIds={hintIds}
              konamiHintId={konamiHintId}
              reviewIds={reviewIds}
              masteredIds={masteredIds}
              newChipId={newChipId}
              cravingCategory={cravingCategory}
            />
          </>
        )}
      </div>

      {flying && (
        <FlyingChip
          word={flying.word}
          startX={flying.startX}
          startY={flying.startY}
          endX={flying.endX}
          endY={flying.endY}
          onDone={() => setFlying(null)}
        />
      )}

      {poopHint && (
        <div style={{
          position: 'fixed',
          bottom: 140,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a2e',
          color: 'white',
          padding: '12px 22px',
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 700,
          zIndex: 200,
          pointerEvents: 'none',
          animation: 'fadeSlideUp 0.3s ease',
          whiteSpace: 'nowrap',
          boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
        }}>
          💩 ele digere e entrega em português
        </div>
      )}

      {masteryWord && (
        <MasteryToast
          word={masteryWord}
          isKids={isKids}
          onDone={() => { setMasteryWord(null); setJustMastered(false) }}
        />
      )}

      {levelUpData !== null && (
        <LevelUpOverlay
          level={levelUpData.level}
          newCategories={levelUpData.newCats}
          onDone={() => setLevelUpData(null)}
        />
      )}

      <BububuPhone
        open={showPhone}
        onClose={() => setShowPhone(false)}
        level={computedLevel}
        wordsLearned={progress.wordsLearned}
        streak={progress.streak ?? 0}
        userName={progress.userName}
        isKids={isKids}
      />

<SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        level={computedLevel}
        wordsLearned={progress.wordsLearned.length}
        streak={progress.streak ?? 0}
        mode={progress.mode}
        difficulty={progress.difficulty}
        onSetMode={setMode}
        onSetDifficulty={d => {
          setDifficulty(d)
          setChips(getRandomChips(4, getUnlockedPool(computedLevel, d)))
        }}
        onReset={() => { resetProgress(); onResetToOnboarding?.() }}
        onShowProgress={() => { setShowSettings(false); setShowProgress(true) }}
      />

      <CategoryProgress
        open={showProgress}
        onClose={() => setShowProgress(false)}
        wordsLearned={progress.wordsLearned}
        level={computedLevel}
        difficulty={progress.difficulty}
      />

      {showShare && (
        <ShareCard
          mode={progress.mode}
          level={computedLevel}
          wordsLearned={progress.wordsLearned.length}
          streak={progress.streak}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* ── Toast de streak ──────────────────────────────────────── */}
      {streakToast && (
        <div style={{
          position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, pointerEvents: 'none',
          background: 'linear-gradient(135deg, #92400e, #d97706)',
          color: '#fff',
          borderRadius: 99,
          padding: '10px 22px',
          fontSize: 15, fontWeight: 800,
          boxShadow: '0 4px 20px rgba(217,119,6,0.55)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          {progress.streak} dias seguidos!
        </div>
      )}

      <SuperPeidoOverlay active={superPeido} onDone={() => setSuperPeido(false)} />
      <WorldUnlockOverlay worldId={newlyUnlocked} onDone={dismissNewlyUnlocked} />
      {evolutionStage && (
        <EvolutionOverlay
          stage={evolutionStage}
          phrase={getBubPhrase('evolution', undefined, evolutionStage, undefined, progress.userName)}
          onDone={() => setEvolutionStage(null)}
        />
      )}

      <ComboOverlay combo={activeCombo} onDone={() => setActiveCombo(null)} />

      {/* ── Confetti jackpot ───────────────────────────────────────── */}
      <ConfettiRain active={confettiActive} />

      {/* ── Particle bursts (via portal, fora do DOM) ──────────────── */}
      {bursts.map(b => (
        <ParticleBurst
          key={b.id}
          burst={b}
          onDone={id => setBursts(prev => prev.filter(x => x.id !== id))}
        />
      ))}

      {/* ── Screen flash jackpot / bonus ───────────────────────────── */}
      {screenFlash && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: screenFlash,
          pointerEvents: 'none',
          animation: 'screen-flash 0.48s ease-out forwards',
        }} />,
        document.body
      )}

      {/* ── Easter egg: bullet time ─────────────────────────────────── */}
      {bulletTimePhase !== 'off' && createPortal(
        <>
          <style>{`
            @keyframes present-slide-in {
              from { opacity: 0; transform: translateY(24px) scale(0.7); }
              to   { opacity: 1; transform: translateY(0)    scale(1);   }
            }
            @keyframes present-pulse {
              0%, 100% { transform: scale(1);    }
              50%       { transform: scale(1.12); }
            }
            @keyframes present-burst {
              0%   { transform: scale(1);    opacity: 1;   filter: brightness(1); }
              12%  { transform: scale(1.9);  opacity: 1;   filter: brightness(2.2); }
              40%  { transform: scale(2.4);  opacity: 0.5; filter: brightness(1.4); }
              100% { transform: scale(3.0);  opacity: 0;   filter: brightness(1); }
            }
            @keyframes present-particle {
              0%   { transform: translate(0, 0) scale(1.2); opacity: 1; }
              15%  { opacity: 1; }
              100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
            }
            @keyframes bt-zoom {
              from { opacity:0; transform:scale(0.05) rotate(-8deg); filter:blur(6px); }
              to   { opacity:1; transform:scale(1)    rotate(0deg);  filter:blur(0);  }
            }
            @keyframes bt-impact {
              0%   { transform:scale(1);   opacity:1; filter:brightness(1); }
              35%  { transform:scale(1.5); opacity:1; filter:brightness(2.5); }
              100% { transform:scale(2.5); opacity:0; filter:brightness(1); }
            }
          `}</style>
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9990,
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: 52, fontWeight: 900,
              color: '#ffffff',
              letterSpacing: 6,
              textShadow: '0 0 40px rgba(251,191,36,0.9), 0 0 80px rgba(251,191,36,0.4)',
              willChange: 'transform, opacity, filter',
              animation: bulletTimePhase === 'fly'
                ? 'bt-zoom 2.5s cubic-bezier(0.12,0,0.04,1) forwards'
                : 'bt-impact 0.55s ease-out forwards',
            }}>
              {bulletTimeWord}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
