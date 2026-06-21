import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PoopReveal } from '@/components/ui/PoopReveal'
import { WordChips } from '@/components/ui/WordChips'
import { FlyingChip } from '@/components/ui/FlyingChip'
import { XpBar } from '@/components/ui/XpBar'
import { LevelUpOverlay } from '@/components/ui/LevelUpOverlay'
import { ComboOverlay } from '@/components/ui/ComboOverlay'
import type { ComboData } from '@/components/ui/ComboOverlay'
import { BububuCharacter } from '@/components/bububu/BububuCharacter'
import { useFeed } from '@/features/feed/useFeed'
import { useBububuVoice, useAudio } from '@/lib/audio/useAudio'
import {
  playWhoosh,
  playSnap,
  playMunch,
  playFart,
  playCoinNormal,
  playCoinBonus,
  playCoinJackpot,
  playComboTrio,
  playComboVS,
  playKonami,
} from '@/lib/audio/sounds'
import { OPPOSITE_PAIRS } from '@/data/vocabulary/opposites'
import { useProgress } from '@/hooks/useProgress'
import { useTheme } from '@/hooks/useTheme'
import { usePetState } from '@/hooks/usePetState'
import { SceneBackground } from '@/components/ui/SceneBackground'
import { FloatingIsland } from '@/components/ui/FloatingIsland'
import { BububuLore } from '@/components/ui/BububuLore'
import { SleepScreen } from '@/features/feed/SleepScreen'
import { SatiationScreen } from '@/features/feed/SatiationScreen'
import { ShareCard } from '@/features/share/ShareCard'
import { MemoryGame } from '@/features/memory/MemoryGame'
import { getWordsByDifficulty } from '@/data/vocabulary'
import type { BubState } from '@/components/bububu/BububuCharacter'
import type { FeedResult, VocabEntry, DifficultyLevel } from '@/types'

interface XpPop { id: number; amount: number; x: number }
interface FlyingData { word: string; startX: number; startY: number; endX: number; endY: number }

// Boca aberta: cx=60, cy=80 em viewBox 0 0 120 140, SVG 140×160px
const MOUTH_OFFSET_X = (60 / 120) * 140   // = 70px do left do SVG
const MOUTH_OFFSET_Y = (80 / 140) * 160   // ≈ 91px do top do SVG

function getRandomChips(count: number, difficulty: DifficultyLevel, excludeIds: string[] = []): VocabEntry[] {
  const allForLevel = getWordsByDifficulty(difficulty)
  const pool        = allForLevel.filter(w => !excludeIds.includes(w.id))
  const source      = pool.length >= count ? pool : allForLevel
  return [...source].sort(() => Math.random() - 0.5).slice(0, count)
}

function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

const KONAMI_SEQUENCE = ['sleep', 'morning', 'coffee', 'work', 'happy']

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

export function FeedScreen() {
  const { feedWord }                                           = useFeed()
  const { speakBububu }                                        = useBububuVoice()
  const { speakWord }                                          = useAudio()
  const { progress, computedLevel, levelProgress, dailyLimit, recordWord, setMode, setDifficulty } = useProgress()
  const [showSettings, setShowSettings] = useState(false)
  const [showShare, setShowShare]       = useState(false)

  const [chips, setChips]         = useState<VocabEntry[]>(() => getRandomChips(3, progress.difficulty))
  const [flying, setFlying]       = useState<FlyingData | null>(null)
  const [flyingId, setFlyingId]   = useState<string | null>(null)
  const [result, setResult]       = useState<FeedResult | null>(null)
  const [bubState, setBubState]   = useState<BubState>('idle')
  const [isReview, setIsReview]   = useState(false)
  const [xpPops, setXpPops]       = useState<XpPop[]>([])
  const [munchText, setMunchText] = useState(false)
  const [levelUpShow, setLevelUpShow] = useState<number | null>(null)
  const [poopHint, setPoopHint]         = useState(false)
  const [isBurp, setIsBurp]             = useState(false)
  const [showSatiation,  setShowSatiation]  = useState(false)
  const [showMemory,     setShowMemory]     = useState(false)
  const [memoryFromSat,  setMemoryFromSat]  = useState(false)  // veio da SatiationScreen?
  const [forceAwake,     setForceAwake]     = useState(false)
  const [overLimit, setOverLimit]         = useState(false)
  const [showPoop, setShowPoop]         = useState(false)
  const [poopFixed, setPoopFixed]       = useState<{x:number,fromY:number,dropPx:number}|null>(null)
  const [poopSplat, setPoopSplat]         = useState(false)
  const splatTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const bubContainerRef  = useRef<HTMLDivElement>(null)
  const resultZoneRef    = useRef<HTMLDivElement>(null)
  const poopTimerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const clearTimerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const popId            = useRef(0)
  const feeding          = useRef(false)
  const prevLevel        = useRef(computedLevel)
  const lastFedWords     = useRef<VocabEntry[]>([])
  const konamiProgress   = useRef(0)

  const [activeCombo, setActiveCombo] = useState<ComboData | null>(null)

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
      prevLevel.current = computedLevel
      setLevelUpShow(computedLevel)
    }
  }, [computedLevel])

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

  function triggerXpPop(amount: number) {
    const id = ++popId.current
    setXpPops(prev => [...prev, { id, amount, x: Math.random() * 40 - 20 }])
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 950)
  }

  const handleChipSelect = useCallback(async (entry: VocabEntry, rect: DOMRect) => {
    if (feeding.current) return
    feeding.current = true

    const mouth = getMouthPos()

    // ── t0: tap ──────────────────────────────────────────────────────────────
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
    const { isNew, justSatiated, overLimit: isOver } = recordWord(entry)
    setIsReview(!isNew)
    setOverLimit(isOver)
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
    setResult(feedResult)
    const soundType = playFart()
    setIsBurp(soundType === 'burp')

    // Ciclo do 💩: aparece → some em 2.5s → resultado some em 5.5s
    clearTimeout(poopTimerRef.current)
    clearTimeout(clearTimerRef.current)
    setShowPoop(true)
    poopTimerRef.current  = setTimeout(() => setShowPoop(false), 2500)
    clearTimerRef.current = setTimeout(() => {
      setResult(null)
      setIsBurp(false)
    }, 5500)

    // Hint one-time
    if (!localStorage.getItem('bub_poop_hint')) {
      localStorage.setItem('bub_poop_hint', '1')
      setPoopHint(true)
      setTimeout(() => setPoopHint(false), 2800)
    }

    // ── Rachel fala a palavra → Bububu reage depois ───────────────────────────
    await delay(300)                        // pausa: usuário lê o card
    await speakWord(feedResult.entry.word)  // ElevenLabs — awaited, sem sobreposição
    speakBububu()                           // "bububu!" só após Rachel terminar

    // ── recompensa ────────────────────────────────────────────────────────────
    await delay(300)
    if (isNew) {
      triggerXpPop(isOver ? Math.ceil(feedResult.xpGained / 2) : feedResult.xpGained)
      if      (feedResult.rewardTier === 'jackpot')       playCoinJackpot()
      else if (feedResult.rewardTier === 'context_bonus') playCoinBonus()
      else                                                 playCoinNormal()
    }

    setBubState(
      !isNew || feedResult.rewardTier === 'normal' ? 'idle' : 'celebrating'
    )

    // ── t0 + 2880ms: reabastece chip ─────────────────────────────────────────
    await delay(600)
    setFlyingId(null)
    setChips(prev => {
      const remaining = prev.filter(c => c.id !== entry.id)
      const exclude   = [...remaining.map(c => c.id), entry.id]
      return [...remaining, ...getRandomChips(1, progress.difficulty, exclude)]
    })
    setBubState('idle')
    feeding.current = false

    // ── Combo detection ───────────────────────────────────────────────────────
    const w = entry.word.toLowerCase()
    lastFedWords.current = [...lastFedWords.current, entry].slice(-5)

    let comboFired = false

    // 1. Konami (highest priority) — sequence: sleep→morning→coffee→work→happy
    if (w === KONAMI_SEQUENCE[konamiProgress.current]) {
      konamiProgress.current++
      if (konamiProgress.current === KONAMI_SEQUENCE.length) {
        konamiProgress.current = 0
        lastFedWords.current = []
        playKonami()
        setActiveCombo({ type: 'konami', words: [...KONAMI_SEQUENCE] })
        comboFired = true
      }
    } else {
      konamiProgress.current = w === KONAMI_SEQUENCE[0] ? 1 : 0
    }

    // 2. Opposites VS — hot→cold, big→small, morning→night, etc.
    if (!comboFired && lastFedWords.current.length >= 2) {
      const prevEntry = lastFedWords.current[lastFedWords.current.length - 2]
      if (OPPOSITE_PAIRS[w] === prevEntry.word.toLowerCase()) {
        lastFedWords.current = []
        playComboVS()
        setActiveCombo({ type: 'versus', words: [prevEntry.word, entry.word] })
        comboFired = true
      }
    }

    // 3. Semantic Trio — 3 consecutive words from the same category
    if (!comboFired && lastFedWords.current.length >= 3) {
      const last3 = lastFedWords.current.slice(-3)
      if (last3.every(e2 => e2.category === last3[0].category)) {
        lastFedWords.current = []
        playComboTrio()
        setActiveCombo({
          type: 'trio',
          words: last3.map(e2 => e2.word),
          category: last3[0].category,
        })
      }
    }

    // ── Saciedade: mostra tela após animação completa ─────────────────────────
    if (justSatiated) {
      await delay(800)
      setShowSatiation(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedWord, speakBububu, speakWord, recordWord, dailyLimit])

  const theme     = useTheme()
  const isKids    = theme.isKids
  const wordCount = progress.wordsLearned.length
  const streak    = progress.streak
  const isFeeding = flyingId !== null

  const { isSleeping, hoursHungry } = usePetState(progress.mode, progress.lastFedAt)

  // Mapeia fome → visual do Bububu quando idle
  const idleMood = (): BubState => {
    if (forceAwake && isSleeping) return 'yawning'
    if (hoursHungry >= 12) return 'sad'
    return 'idle'
  }

  const activeBubState: BubState = bubState !== 'idle' ? bubState : idleMood()
  const isHungryIdle = hoursHungry >= 2 && bubState === 'idle'

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
        onContinue={() => { setShowSatiation(false); setOverLimit(true) }}
        onPlayMemory={progress.wordsLearned.length >= 2
          ? () => { setShowSatiation(false); setMemoryFromSat(true); setShowMemory(true) }
          : undefined
        }
      />
    )
  }

  // Indicador de apetite — dots no header
  const wordsToday  = progress.wordsToday ?? 0
  const appetiteDots = Array.from({ length: dailyLimit }, (_, i) => i < wordsToday)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      background: theme.bgGradient,
    }}>
      <SceneBackground isKids={isKids} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <XpBar level={computedLevel} progress={levelProgress} />
      </div>

      {/* Dots de apetite diário */}
      <div style={{
        display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center',
        padding: '4px 0 0', position: 'relative', zIndex: 1,
      }}>
        {appetiteDots.map((filled, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: filled
              ? (isKids ? '#f59e0b' : '#a78bfa')
              : (isKids ? 'rgba(45,31,107,0.18)' : 'rgba(255,255,255,0.15)'),
            transition: 'background 0.4s ease',
            boxShadow: filled
              ? `0 0 6px ${isKids ? 'rgba(245,158,11,0.6)' : 'rgba(167,139,250,0.6)'}`
              : 'none',
          }} />
        ))}
        {overLimit && (
          <span style={{ fontSize: 10, marginLeft: 4, color: isKids ? '#b45309' : 'rgba(196,181,253,0.55)' }}>
            ½ XP
          </span>
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
        >📚 {wordCount} word{wordCount !== 1 ? 's' : ''}</span>
        {streak > 0 && <span>🔥 {streak} day{streak !== 1 ? 's' : ''}</span>}

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

          {showSettings && createPortal(
            <>
              <div
                onClick={() => setShowSettings(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 990 }}
              />
              <div style={{
                position: 'fixed', top: 86, right: 16,
                background: 'rgba(20,5,50,0.97)',
                border: '1px solid rgba(167,139,250,0.28)',
                borderRadius: 14, padding: '14px 16px',
                zIndex: 1000, minWidth: 180,
                animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                  MODO DE USO
                </div>
                {([
                  { m: 'kids' as const, label: '🌱 Kids', sub: '6 a 12 anos' },
                  { m: 'pro'  as const, label: '⚡ Pro',  sub: '13 anos ou mais' },
                ]).map(({ m, label, sub }) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setShowSettings(false) }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      width: '100%',
                      background: progress.mode === m ? 'rgba(124,58,237,0.35)' : 'transparent',
                      border: progress.mode === m ? '1px solid rgba(167,139,250,0.40)' : '1px solid transparent',
                      borderRadius: 9, padding: '8px 10px',
                      cursor: 'pointer', marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#e9d5ff' }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.50)', marginTop: 1 }}>{sub}</span>
                  </button>
                ))}
                <div style={{ height: 1, background: 'rgba(196,181,253,0.12)', margin: '8px 0' }} />
                <div style={{ fontSize: 10, color: 'rgba(196,181,253,0.45)', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                  NÍVEL
                </div>
                {([
                  { d: 'easy'   as const, label: '🌱 Fácil' },
                  { d: 'medium' as const, label: '⚡ Médio' },
                  { d: 'hard'   as const, label: '🔥 Difícil' },
                ]).map(({ d, label }) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficulty(d)
                      setChips(getRandomChips(3, d))
                      setShowSettings(false)
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      width: '100%',
                      background: progress.difficulty === d ? 'rgba(124,58,237,0.35)' : 'transparent',
                      border: progress.difficulty === d ? '1px solid rgba(167,139,250,0.40)' : '1px solid transparent',
                      borderRadius: 9, padding: '8px 10px',
                      cursor: 'pointer', marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#e9d5ff' }}>{label}</span>
                  </button>
                ))}
              </div>
            </>,
            document.body
          )}
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
        <BububuCharacter
          state={activeBubState}
          rewardTier={result?.rewardTier}
          onTap={speakBububu}
          onMegaFart={() => {
            playFart()
            setTimeout(() => playFart(), 400)
            setTimeout(() => playFart(), 900)
          }}
          hungry={isHungryIdle}
        />
        {xpPops.map(pop => (
          <div key={pop.id} style={{
            position: 'absolute',
            top: 8,
            left: `calc(50% + ${pop.x}px)`,
            fontWeight: 800,
            fontSize: 18,
            color: '#7c3aed',
            pointerEvents: 'none',
            animation: 'xp-pop 0.95s ease-out forwards',
            whiteSpace: 'nowrap',
          }}>
            +{pop.amount} XP
          </div>
        ))}
        <FloatingIsland />

        {/* Yum text flutua do lado da boca do Bububu */}
        {munchText && (
          <div style={{
            position: 'absolute',
            top: '48%',
            left: 'calc(50% + 58px)',
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
            zIndex: 5,
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
          </div>
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
          {isBurp ? '🤢' : '💩'}
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

      {/* Zona de resultado — altura fixa, nunca cresce */}
      <div ref={resultZoneRef} style={{
        flexShrink: 0,
        height: 136,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        {result && !munchText && (
          <div style={{
            width: '100%',
            background: theme.resultZoneBg,
            border: theme.resultZoneBorder,
            borderRadius: theme.resultZoneRadius,
            boxShadow: isKids && result ? '0 4px 20px rgba(255,217,61,0.20)' : 'none',
          }}>
            <PoopReveal result={result} isReview={isReview} isBurp={isBurp} isKids={isKids} />
          </div>
        )}
        {!result && !munchText && !isFeeding && (
          <p style={{
            color: isKids ? 'rgba(45,31,107,0.50)' : 'rgba(255,255,255,0.55)',
            fontSize: 14, margin: 0, textAlign: 'center', lineHeight: 1.6,
            fontWeight: isKids ? 600 : 400,
          }}>
            {isKids ? 'Dá uma palavra pro Bububu! 🍭' : 'Dá uma palavra pro Bububu... 👀'}
          </p>
        )}
      </div>

      <div style={{
        flexShrink: 0,
        padding: '12px 20px 28px',
        background: isKids ? 'rgba(255,255,255,0.70)' : 'rgba(15,5,40,0.75)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: isKids ? '2px solid rgba(255,217,61,0.40)' : '1px solid rgba(196,132,252,0.30)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
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
        />
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
          💩 He poops the translation!
        </div>
      )}

      {levelUpShow !== null && (
        <LevelUpOverlay
          level={levelUpShow}
          onDone={() => setLevelUpShow(null)}
        />
      )}

      <BububuLore />

      {showShare && (
        <ShareCard
          mode={progress.mode}
          level={computedLevel}
          wordsLearned={progress.wordsLearned.length}
          streak={progress.streak}
          onClose={() => setShowShare(false)}
        />
      )}

      <ComboOverlay combo={activeCombo} onDone={() => setActiveCombo(null)} />
    </div>
  )
}
