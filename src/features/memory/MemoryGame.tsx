import { useState, useEffect, useCallback } from 'react'
import { ALL_WORDS } from '@/data/vocabulary'
import type { AppMode, VocabEntry } from '@/types'
import { playSnap, playCoinJackpot } from '@/lib/audio/sounds'

// Número fixo de pares no Memory — independente do daily limit
const MEMORY_PAIRS = 6

// ─── Emoji map — palavra → emoji ─────────────────────────────────────────────
const WORD_EMOJI: Record<string, string> = {
  // A1 — Food & Drink
  apple:'🍎', water:'💧', bread:'🍞', milk:'🥛', egg:'🥚', rice:'🍚',
  coffee:'☕', banana:'🍌', orange:'🍊', cake:'🎂', soup:'🍲', salad:'🥗',
  meat:'🥩', fish:'🐟', juice:'🧃', beer:'🍺', wine:'🍷', tea:'🍵',
  // A1 — Home & Objects
  house:'🏠', door:'🚪', window:'🪟', chair:'🪑', table:'🍽️', bed:'🛏️',
  book:'📚', pen:'✏️', paper:'📄', phone:'📱', computer:'💻', key:'🔑',
  bag:'👜', hat:'🎩', shoe:'👟', shirt:'👕', clock:'🕐', lamp:'💡',
  // A1 — Transport
  car:'🚗', bus:'🚌', train:'🚂', plane:'✈️', bike:'🚲', boat:'⛵',
  taxi:'🚕', truck:'🚛', motorcycle:'🏍️', helicopter:'🚁',
  // A1 — Nature
  sun:'☀️', moon:'🌙', star:'⭐', rain:'🌧️', snow:'❄️', cloud:'☁️',
  tree:'🌳', flower:'🌸', mountain:'⛰️', sea:'🌊', river:'🏞️', fire:'🔥',
  // A1 — Animals
  dog:'🐶', cat:'🐱', bird:'🐦', horse:'🐴', cow:'🐮', pig:'🐷',
  lion:'🦁', elephant:'🐘', monkey:'🐒', snake:'🐍', rabbit:'🐰',
  // A1 — People & Places
  doctor:'👨‍⚕️', school:'🏫', hospital:'🏥', shop:'🛍️', bank:'🏦',
  hotel:'🏨', park:'🌿', city:'🌆', village:'🏘️', beach:'🏖️',
  family:'👨‍👩‍👧', friend:'🤝', baby:'👶', boy:'👦', girl:'👧',
  // A1 — Feelings & States
  happy:'😊', sad:'😢', angry:'😠', tired:'😴', hungry:'😋', scared:'😨',
  // A1 — Numbers & Common
  money:'💰', time:'⏰', day:'📅', year:'📆', food:'🍔', work:'💼',
  // A2 — Feelings
  excited:'🤩', worried:'😟', bored:'😑', proud:'🥇', nervous:'😰',
  surprised:'😲', confused:'😕', embarrassed:'😳', relaxed:'😌',
  // A2 — Work & Business
  meeting:'👥', deadline:'⏳', office:'🏢', boss:'👔', project:'📋',
  email:'📧', salary:'💵', interview:'🤝', colleague:'🧑‍💼', client:'🤝',
  report:'📑', schedule:'📅', goal:'🎯', budget:'💰', feedback:'💬',
  team:'👥', manager:'🧑‍💼', company:'🏢', profit:'📈', quality:'⭐',
  // A2 — Daily life
  exercise:'🏋️', gym:'💪', sport:'⚽', travel:'✈️', vacation:'🏝️',
  cooking:'🍳', cleaning:'🧹', shopping:'🛒', reading:'📖', music:'🎵',
  movie:'🎬', party:'🎉', birthday:'🎂', wedding:'💒', gift:'🎁',
  // B1 — Actions & Concepts
  explain:'💡', suggest:'💭', describe:'📝', agree:'✅', disagree:'❌',
  opinion:'🗣️', discuss:'💬', present:'📊', negotiate:'🤝', influence:'🧲',
  analyze:'🔍', evaluate:'📊', implement:'🔧', achieve:'🏆', develop:'📈',
  improve:'⬆️', challenge:'⚡', opportunity:'🚀', responsibility:'🏋️',
  confidence:'💪', communication:'📡', leadership:'👑', strategy:'♟️',
  performance:'⭐', commitment:'🤝', deadline2:'⏰',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type CardType = 'emoji' | 'word' | 'en' | 'pt'

interface MemoryCard {
  uid:     string
  pairId:  string
  type:    CardType
  text:    string    // emoji char ou palavra
  label?:  string    // legenda opcional (tradução no verso matched)
  matched: boolean
}

interface Props {
  mode:         AppMode
  wordsLearned: string[]
  onDone:       () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ALL_WORDS_MAP = new Map<string, VocabEntry>(ALL_WORDS.map(w => [w.id, w]))

function buildCards(wordsLearned: string[], pairCount: number): MemoryCard[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (let i = wordsLearned.length - 1; i >= 0 && ids.length < pairCount; i--) {
    const id = wordsLearned[i]
    if (!seen.has(id) && ALL_WORDS_MAP.has(id)) { seen.add(id); ids.push(id) }
  }

  const pairs: MemoryCard[] = []
  for (const id of ids) {
    const e = ALL_WORDS_MAP.get(id)!
    const emoji = WORD_EMOJI[e.word.toLowerCase()]
    if (emoji) {
      // Par visual: emoji ↔ palavra inglês
      pairs.push(
        { uid: `${id}_emoji`, pairId: id, type: 'emoji', text: emoji, label: e.translation, matched: false },
        { uid: `${id}_word`,  pairId: id, type: 'word',  text: e.word, label: e.translation, matched: false },
      )
    } else {
      // Fallback: EN ↔ PT
      pairs.push(
        { uid: `${id}_en`, pairId: id, type: 'en', text: e.word,        label: e.translation, matched: false },
        { uid: `${id}_pt`, pairId: id, type: 'pt', text: e.translation, matched: false },
      )
    }
  }
  return pairs.sort(() => Math.random() - 0.5)
}

function starsFor(moves: number, pairCount: number): number {
  if (moves <= pairCount + 2) return 3
  if (moves <= pairCount * 2) return 2
  return 1
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ card, flipped, isKids, onClick }: {
  card: MemoryCard; flipped: boolean; isKids: boolean; onClick: () => void
}) {
  const show    = flipped || card.matched
  const isEmoji = card.type === 'emoji'
  const isWord  = card.type === 'word'
  const isEn    = card.type === 'en'

  const bgDown    = isKids ? '#fbbf24' : '#4c1d95'
  const bgEmoji   = isKids ? '#fff9e6' : 'rgba(251,191,36,0.15)'
  const bgWord    = isKids ? '#fff'    : 'rgba(139,92,246,0.25)'
  const bgPt      = isKids ? '#f0fdf4' : 'rgba(52,211,153,0.15)'
  const bgMatched = isKids ? '#d1fae5' : 'rgba(52,211,153,0.22)'

  const bg = card.matched ? bgMatched
    : !show ? bgDown
    : isEmoji ? bgEmoji
    : isWord || isEn ? bgWord
    : bgPt

  const borderMatched = isKids ? '2px solid #6BCB77' : '2px solid rgba(52,211,153,0.65)'
  const borderDown    = isKids ? '2px solid rgba(0,0,0,0.10)' : '2px solid rgba(139,92,246,0.40)'
  const borderEmoji   = isKids ? '2px solid rgba(251,191,36,0.50)' : '2px solid rgba(251,191,36,0.40)'
  const borderWord    = isKids ? '2px solid rgba(124,58,237,0.30)' : '2px solid rgba(139,92,246,0.55)'
  const borderPt      = isKids ? '2px solid rgba(52,211,153,0.40)' : '2px solid rgba(52,211,153,0.40)'

  const border = card.matched ? borderMatched
    : !show ? borderDown
    : isEmoji ? borderEmoji
    : isWord || isEn ? borderWord
    : borderPt

  return (
    <div
      onClick={card.matched ? undefined : onClick}
      style={{
        background: bg, border, borderRadius: 12,
        aspectRatio: '1',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: card.matched ? 'default' : 'pointer',
        padding: 4, position: 'relative',
        transition: 'background 0.25s, border-color 0.25s',
        WebkitTapHighlightColor: 'transparent',
        transform: card.matched ? 'scale(0.96)' : 'scale(1)',
        boxShadow: show && !card.matched
          ? (isKids ? '0 3px 10px rgba(0,0,0,0.12)' : '0 3px 14px rgba(124,58,237,0.35)')
          : 'none',
      }}
    >
      {!show && (
        <span style={{ fontSize: 28, userSelect: 'none' }}>🫧</span>
      )}
      {show && isEmoji && (
        // Carta de emoji — grande e sem label
        <span style={{ fontSize: 38, lineHeight: 1, userSelect: 'none' }}>{card.text}</span>
      )}
      {show && (isWord || isEn) && (
        // Carta de palavra inglês
        <>
          {!isWord && (
            <span style={{
              fontSize: 8, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
              color: isKids ? 'rgba(124,58,237,0.55)' : 'rgba(196,181,253,0.60)',
              marginBottom: 2,
            }}>EN</span>
          )}
          <span style={{
            fontSize: card.text.length > 10 ? 11 : card.text.length > 7 ? 13 : 16,
            fontWeight: 900,
            color: isKids ? '#2D1F6B' : '#e9d5ff',
            textAlign: 'center', lineHeight: 1.2,
            wordBreak: 'break-word', padding: '0 4px',
          }}>
            {card.text}
          </span>
          {card.matched && card.label && (
            <span style={{
              fontSize: 9, marginTop: 3, fontStyle: 'italic',
              color: isKids ? 'rgba(45,31,107,0.50)' : 'rgba(196,181,253,0.50)',
            }}>{card.label}</span>
          )}
        </>
      )}
      {show && card.type === 'pt' && (
        <>
          <span style={{
            fontSize: 8, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
            color: isKids ? 'rgba(22,163,74,0.60)' : 'rgba(52,211,153,0.65)',
            marginBottom: 2,
          }}>PT</span>
          <span style={{
            fontSize: card.text.length > 10 ? 11 : card.text.length > 7 ? 13 : 16,
            fontWeight: 700, fontStyle: 'italic',
            color: isKids ? '#065f46' : '#a7f3d0',
            textAlign: 'center', lineHeight: 1.2,
            wordBreak: 'break-word', padding: '0 4px',
          }}>
            {card.text}
          </span>
        </>
      )}
      {card.matched && (
        <span style={{ position: 'absolute', bottom: 3, right: 5, fontSize: 10, opacity: 0.7 }}>✓</span>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function MemoryGame({ mode, wordsLearned, onDone }: Props) {
  const isKids    = mode === 'kids'
  const pairCount = Math.min(MEMORY_PAIRS, wordsLearned.length)

  const [cards,    setCards]    = useState(() => buildCards(wordsLearned, pairCount))
  const [flipped,  setFlipped]  = useState<string[]>([])
  const [checking, setChecking] = useState(false)
  const [moves,    setMoves]    = useState(0)
  const [complete, setComplete] = useState(false)

  const actualPairs  = cards.length / 2
  const matchedCount = cards.filter(c => c.matched && (c.type === 'emoji' || c.type === 'en')).length

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimeout(() => { playCoinJackpot(); setComplete(true) }, 500)
    }
  }, [cards])

  const handleFlip = useCallback((uid: string) => {
    if (checking) return
    const card = cards.find(c => c.uid === uid)
    if (!card || card.matched || flipped.includes(uid)) return

    if (flipped.length === 0) { setFlipped([uid]); return }

    if (flipped.length === 1) {
      const firstUid = flipped[0]
      const first    = cards.find(c => c.uid === firstUid)!
      setFlipped([firstUid, uid])
      setMoves(m => m + 1)

      if (first.pairId === card.pairId && first.type !== card.type) {
        playSnap()
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.uid === firstUid || c.uid === uid ? { ...c, matched: true } : c
          ))
          setFlipped([])
        }, 400)
      } else {
        setChecking(true)
        setTimeout(() => { setFlipped([]); setChecking(false) }, 900)
      }
    }
  }, [checking, flipped, cards])

  const stars = starsFor(moves, actualPairs)

  // ── Tela de conclusão ───────────────────────────────────────────────────────
  if (complete) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1,
        background: isKids
          ? 'linear-gradient(170deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)'
          : 'linear-gradient(170deg, #1c0a3d 0%, #2d1060 50%, #1a1040 100%)',
        padding: '32px 24px', gap: 16,
      }}>
        <div style={{ fontSize: 72, lineHeight: 1 }}>🎉</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: isKids ? '#92400e' : '#e9d5ff', marginBottom: 6 }}>
            Você lembrou tudo!
          </div>
          <div style={{ fontSize: 13, color: isKids ? 'rgba(120,60,0,0.65)' : 'rgba(196,181,253,0.65)' }}>
            {actualPairs} pares em {moves} tentativa{moves !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map(n => (
            <span key={n} style={{
              fontSize: 38,
              filter: n <= stars ? 'none' : 'grayscale(1) opacity(0.25)',
            }}>⭐</span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: isKids ? 'rgba(120,60,0,0.50)' : 'rgba(196,181,253,0.45)' }}>
          {stars === 3 ? 'Memória perfeita! 🧠' : stars === 2 ? 'Muito bem!' : 'Continue praticando!'}
        </div>
        <button onClick={onDone} style={{
          marginTop: 8, padding: '14px 40px', borderRadius: 16, border: 'none',
          background: isKids ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: isKids ? '#2D1F6B' : '#fff',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: isKids ? '0 5px 0 #b45309' : '0 5px 0 #4c1d95',
          WebkitTapHighlightColor: 'transparent',
        }}>Voltar</button>
      </div>
    )
  }

  // ── Tela do jogo ────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      background: isKids
        ? 'linear-gradient(170deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)'
        : 'linear-gradient(170deg, #1c0a3d 0%, #2d1060 50%, #1a1040 100%)',
      padding: '16px 16px 24px', gap: 12, overflowY: 'auto',
      alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 400 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: isKids ? '#92400e' : '#e9d5ff' }}>
            🃏 Memory
          </div>
          <div style={{ fontSize: 11, color: isKids ? 'rgba(120,60,0,0.55)' : 'rgba(196,181,253,0.55)' }}>
            {matchedCount}/{actualPairs} pares · {moves} tentativas
          </div>
        </div>
        <button onClick={onDone} style={{
          background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', padding: '6px 10px',
          color: isKids ? 'rgba(120,60,0,0.45)' : 'rgba(196,181,253,0.40)',
        }}>Sair</button>
      </div>

      {/* Progresso */}
      <div style={{ height: 5, borderRadius: 99, background: isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)', overflow: 'hidden', width: '100%', maxWidth: 400 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${(matchedCount / actualPairs) * 100}%`,
          background: isKids ? '#f59e0b' : '#a78bfa',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Legenda */}
      <div style={{ textAlign: 'center', fontSize: 12, color: isKids ? 'rgba(120,60,0,0.50)' : 'rgba(196,181,253,0.45)' }}>
        Une o emoji com a palavra em inglês
      </div>

      {/* Grid — 4 colunas, cartas com tamanho fixo (~80px em mobile, ~90px em desktop) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(60px, 90px))',
        gap: 10,
        justifyContent: 'center',
        width: '100%',
      }}>
        {cards.map(card => (
          <Card key={card.uid} card={card} flipped={flipped.includes(card.uid)} isKids={isKids} onClick={() => handleFlip(card.uid)} />
        ))}
      </div>
    </div>
  )
}
