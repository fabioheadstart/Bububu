import { useState, useEffect, useCallback } from 'react'
import { ALL_WORDS } from '@/data/vocabulary'
import type { AppMode, VocabEntry } from '@/types'
import { playSnap, playCoinJackpot, playNavTap, playQuizWrong } from '@/lib/audio/sounds'

const MEMORY_PAIRS_KIDS = 3
const MEMORY_PAIRS_PRO  = 6

// ─── Emoji map ────────────────────────────────────────────────────────────────
const WORD_EMOJI: Record<string, string> = {
  apple:'🍎', water:'💧', bread:'🍞', milk:'🥛', egg:'🥚', rice:'🍚',
  coffee:'☕', banana:'🍌', orange:'🍊', cake:'🎂', soup:'🍲', salad:'🥗',
  meat:'🥩', fish:'🐟', juice:'🧃', beer:'🍺', wine:'🍷', tea:'🍵',
  breakfast:'🍳', lunch:'🥪', dinner:'🍽️', snack:'🍿', chocolate:'🍫',
  cheese:'🧀', butter:'🧈', yogurt:'🥛', cookie:'🍪', pizza:'🍕',
  pasta:'🍝', burger:'🍔', sandwich:'🥙', fruit:'🍓', vegetable:'🥦',
  house:'🏠', door:'🚪', window:'🪟', chair:'🪑', table:'🍽️', bed:'🛏️',
  book:'📚', pen:'✏️', paper:'📄', phone:'📱', computer:'💻', key:'🔑',
  bag:'👜', hat:'🎩', shoe:'👟', shirt:'👕', clock:'🕐', lamp:'💡',
  glasses:'👓', umbrella:'☂️', bottle:'🍶', cup:'☕', plate:'🍽️', spoon:'🥄',
  fork:'🍴', knife:'🔪', mirror:'🪞', sofa:'🛋️', pillow:'🛏️', blanket:'🛌',
  toothbrush:'🪥', soap:'🧼', towel:'🧻', trash:'🗑️', television:'📺',
  car:'🚗', bus:'🚌', train:'🚂', plane:'✈️', bike:'🚲', boat:'⛵',
  taxi:'🚕', truck:'🚛', motorcycle:'🏍️', helicopter:'🚁',
  sun:'☀️', moon:'🌙', star:'⭐', rain:'🌧️', snow:'❄️', cloud:'☁️',
  tree:'🌳', flower:'🌸', mountain:'⛰️', sea:'🌊', river:'🏞️', fire:'🔥',
  dog:'🐶', cat:'🐱', bird:'🐦', horse:'🐴', cow:'🐮', pig:'🐷',
  lion:'🦁', elephant:'🐘', monkey:'🐒', snake:'🐍', rabbit:'🐰',
  frog:'🐸', turtle:'🐢', bear:'🐻', duck:'🦆', owl:'🦉', bee:'🐝',
  doctor:'👨‍⚕️', school:'🏫', hospital:'🏥', shop:'🛍️', bank:'🏦',
  hotel:'🏨', park:'🌿', city:'🌆', village:'🏘️', beach:'🏖️',
  family:'👨‍👩‍👧', friend:'🤝', baby:'👶', boy:'👦', girl:'👧',
  man:'👨', woman:'👩', teacher:'👩‍🏫', student:'🧑‍🎓', nurse:'👩‍⚕️',
  police:'👮', firefighter:'👩‍🚒', cook:'👨‍🍳', farmer:'👨‍🌾', driver:'🧑‍✈️',
  happy:'😊', sad:'😢', angry:'😠', tired:'😴', hungry:'😋', scared:'😨',
  sick:'🤒', healthy:'💪', cold:'🥶', hot:'🥵', busy:'⚡', free:'🕊️',
  money:'💰', time:'⏰', day:'📅', year:'📆', food:'🍔', work:'💼',
  morning:'🌅', afternoon:'🌇', evening:'🌆', night:'🌙', today:'📅', tomorrow:'🗓️',
  yesterday:'◀️', week:'📅', month:'🗓️', hour:'🕐', minute:'⏱️',
  excited:'🤩', worried:'😟', bored:'😑', proud:'🥇', nervous:'😰',
  surprised:'😲', confused:'😕', embarrassed:'😳', relaxed:'😌',
  meeting:'👥', deadline:'⏳', office:'🏢', boss:'👔', project:'📋',
  email:'📧', salary:'💵', interview:'🤝', colleague:'🧑‍💼', client:'🤝',
  report:'📑', schedule:'📅', goal:'🎯', budget:'💰', feedback:'💬',
  team:'👥', manager:'🧑‍💼', company:'🏢', profit:'📈', quality:'⭐',
  exercise:'🏋️', gym:'💪', sport:'⚽', travel:'✈️', vacation:'🏝️',
  cooking:'🍳', cleaning:'🧹', shopping:'🛒', reading:'📖', music:'🎵',
  movie:'🎬', party:'🎉', birthday:'🎂', wedding:'💒', gift:'🎁',
  explain:'💡', suggest:'💭', describe:'📝', agree:'✅', disagree:'❌',
  opinion:'🗣️', discuss:'💬', present:'📊', negotiate:'🤝', influence:'🧲',
  analyze:'🔍', evaluate:'📊', implement:'🔧', achieve:'🏆', develop:'📈',
  improve:'⬆️', challenge:'⚡', opportunity:'🚀', responsibility:'🏋️',
  confidence:'💪', communication:'📡', leadership:'👑', strategy:'♟️',
  performance:'⭐', commitment:'🤝',
}

type CardType = 'emoji' | 'word' | 'en' | 'pt'

interface MemoryCard {
  uid:     string
  pairId:  string
  type:    CardType
  text:    string
  label?:  string
  matched: boolean
}

interface Props {
  mode:         AppMode
  wordsLearned: string[]
  onDone:       () => void
}

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
      pairs.push(
        { uid: `${id}_emoji`, pairId: id, type: 'emoji', text: emoji, label: e.translation, matched: false },
        { uid: `${id}_word`,  pairId: id, type: 'word',  text: e.word, label: e.translation, matched: false },
      )
    } else {
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

// ─── CSS animations ────────────────────────────────────────────────────────────
const MEMORY_CSS = `
  @keyframes mem-shake {
    0%,100% { transform: rotateY(180deg) translateX(0); }
    20%      { transform: rotateY(180deg) translateX(-6px); }
    40%      { transform: rotateY(180deg) translateX(6px); }
    60%      { transform: rotateY(180deg) translateX(-4px); }
    80%      { transform: rotateY(180deg) translateX(4px); }
  }
  @keyframes mem-pop {
    0%   { transform: rotateY(180deg) scale(1); }
    40%  { transform: rotateY(180deg) scale(1.12); }
    100% { transform: rotateY(180deg) scale(1); }
  }
  @keyframes mem-burst {
    0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
    60%  { opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
  }
  @keyframes mem-particle {
    0%   { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(var(--px),var(--py)) scale(0); opacity: 0; }
  }
  @keyframes mem-complete-pop {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); }
  }
  @keyframes mem-star-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`

// ─── Card component ────────────────────────────────────────────────────────────
function Card({ card, flipped, isKids, onClick, isWrong, isNewMatch }: {
  card: MemoryCard
  flipped: boolean
  isKids: boolean
  onClick: () => void
  isWrong: boolean
  isNewMatch: boolean
}) {
  const show = flipped || card.matched

  const cardAnim = isWrong
    ? 'mem-shake 0.38s ease'
    : isNewMatch
      ? 'mem-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)'
      : undefined

  // ── Back face colors ────────────────────────────────────────────────────────
  const backBg = isKids
    ? 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)'
    : 'linear-gradient(145deg, #6d28d9 0%, #5b21b6 55%, #4c1d95 100%)'
  const backShadow = isKids
    ? '0 5px 0 #b45309, 0 7px 18px rgba(0,0,0,0.18)'
    : '0 5px 0 #2e1065, 0 7px 18px rgba(0,0,0,0.40)'

  // ── Front face colors ───────────────────────────────────────────────────────
  const frontBg = card.matched
    ? (isKids ? 'linear-gradient(145deg,#d1fae5,#a7f3d0)' : 'linear-gradient(145deg,rgba(52,211,153,0.22),rgba(16,185,129,0.12))')
    : card.type === 'emoji'
      ? (isKids ? 'linear-gradient(145deg,#fff9e6,#fef3c7)' : 'linear-gradient(145deg,rgba(251,191,36,0.18),rgba(217,119,6,0.10))')
      : card.type === 'word' || card.type === 'en'
        ? (isKids ? 'linear-gradient(145deg,#f5f3ff,#ede9fe)' : 'linear-gradient(145deg,rgba(139,92,246,0.28),rgba(109,40,217,0.18))')
        : (isKids ? 'linear-gradient(145deg,#f0fdf4,#dcfce7)' : 'linear-gradient(145deg,rgba(52,211,153,0.18),rgba(16,185,129,0.10))')

  const frontBorder = card.matched
    ? `2px solid ${isKids ? '#6BCB77' : 'rgba(52,211,153,0.65)'}`
    : card.type === 'emoji'
      ? `2px solid ${isKids ? 'rgba(251,191,36,0.60)' : 'rgba(251,191,36,0.45)'}`
      : card.type === 'word' || card.type === 'en'
        ? `2px solid ${isKids ? 'rgba(124,58,237,0.35)' : 'rgba(139,92,246,0.60)'}`
        : `2px solid ${isKids ? 'rgba(52,211,153,0.45)' : 'rgba(52,211,153,0.45)'}`

  const frontGlow = card.matched
    ? `0 0 18px ${isKids ? 'rgba(107,203,119,0.50)' : 'rgba(52,211,153,0.35)'}, 0 3px 8px rgba(0,0,0,0.10)`
    : `0 3px 10px ${isKids ? 'rgba(0,0,0,0.10)' : 'rgba(124,58,237,0.28)'}`

  return (
    <div
      style={{ perspective: '800px', aspectRatio: '1', cursor: card.matched ? 'default' : 'pointer' }}
      onClick={card.matched ? undefined : onClick}
    >
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.48s cubic-bezier(0.34,1.10,0.64,1)',
        transform: show ? 'rotateY(180deg)' : 'rotateY(0deg)',
        animation: cardAnim,
        WebkitTapHighlightColor: 'transparent',
      }}>

        {/* ── BACK FACE ─────────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: 14,
          background: backBg,
          boxShadow: backShadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Diagonal stripe pattern */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 14,
            backgroundImage: isKids
              ? 'repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(255,255,255,0.14) 9px, rgba(255,255,255,0.14) 18px)'
              : 'repeating-linear-gradient(45deg, transparent, transparent 9px, rgba(255,255,255,0.07) 9px, rgba(255,255,255,0.07) 18px)',
          }} />
          {/* Corner dots */}
          {[['6px','6px'],['6px','auto'],['auto','6px'],['auto','auto']].map(([t,b], i) => (
            <div key={i} style={{
              position: 'absolute',
              top: t === 'auto' ? undefined : t,
              bottom: b === 'auto' ? undefined : b,
              left: i < 2 ? '6px' : undefined,
              right: i >= 2 ? '6px' : undefined,
              width: 5, height: 5, borderRadius: '50%',
              background: isKids ? 'rgba(255,255,255,0.45)' : 'rgba(196,181,253,0.40)',
            }} />
          ))}
          {/* Center emblem */}
          <div style={{
            width: '56%', height: '56%', borderRadius: '50%',
            border: `2px solid ${isKids ? 'rgba(255,255,255,0.50)' : 'rgba(196,181,253,0.40)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isKids ? 'rgba(255,255,255,0.22)' : 'rgba(109,40,217,0.35)',
            fontSize: isKids ? 22 : 16,
            fontWeight: 900,
            color: isKids ? 'rgba(255,255,255,0.90)' : 'rgba(196,181,253,0.80)',
            letterSpacing: -0.5,
          }}>
            {isKids ? '🌟' : 'B'}
          </div>
        </div>

        {/* ── FRONT FACE ────────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 14,
          background: frontBg,
          border: frontBorder,
          boxShadow: frontGlow,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 4, overflow: 'hidden',
        }}>
          {card.type === 'emoji' && (
            <span style={{ fontSize: isKids ? 48 : 38, lineHeight: 1, userSelect: 'none' }}>
              {card.text}
            </span>
          )}

          {(card.type === 'word' || card.type === 'en') && (
            <>
              {card.type === 'en' && !isKids && (
                <span style={{
                  fontSize: 7, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
                  color: 'rgba(196,181,253,0.60)', marginBottom: 2,
                }}>EN</span>
              )}
              <span style={{
                fontSize: isKids
                  ? (card.text.length > 8 ? 13 : 17)
                  : (card.text.length > 10 ? 10 : card.text.length > 7 ? 12 : 15),
                fontWeight: 900,
                color: isKids ? '#2D1F6B' : '#e9d5ff',
                textAlign: 'center', lineHeight: 1.2,
                wordBreak: 'break-word', padding: '0 4px',
              }}>
                {card.text}
              </span>
              {card.matched && card.label && (
                <span style={{
                  fontSize: 8, marginTop: 3, fontStyle: 'italic',
                  color: isKids ? 'rgba(45,31,107,0.50)' : 'rgba(196,181,253,0.50)',
                }}>{card.label}</span>
              )}
            </>
          )}

          {card.type === 'pt' && (
            <>
              {!isKids && (
                <span style={{
                  fontSize: 7, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
                  color: 'rgba(52,211,153,0.65)', marginBottom: 2,
                }}>PT</span>
              )}
              <span style={{
                fontSize: isKids
                  ? (card.text.length > 8 ? 13 : 17)
                  : (card.text.length > 10 ? 10 : card.text.length > 7 ? 12 : 15),
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
            <div style={{
              position: 'absolute', bottom: 4, right: 6,
              fontSize: 11, opacity: 0.75,
              color: isKids ? '#059669' : '#34d399',
            }}>✓</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────
export function MemoryGame({ mode, wordsLearned, onDone }: Props) {
  const isKids    = mode === 'kids'
  const pairCount = Math.min(isKids ? MEMORY_PAIRS_KIDS : MEMORY_PAIRS_PRO, wordsLearned.length)

  const [cards,      setCards]      = useState(() => buildCards(wordsLearned, pairCount))
  const [flipped,    setFlipped]    = useState<string[]>([])
  const [checking,   setChecking]   = useState(false)
  const [moves,      setMoves]      = useState(0)
  const [complete,   setComplete]   = useState(false)
  const [wrongUids,  setWrongUids]  = useState<string[]>([])
  const [newMatches, setNewMatches] = useState<string[]>([])

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

    playNavTap()

    if (flipped.length === 0) { setFlipped([uid]); return }

    if (flipped.length === 1) {
      const firstUid = flipped[0]
      const first    = cards.find(c => c.uid === firstUid)!
      setFlipped([firstUid, uid])
      setMoves(m => m + 1)

      if (first.pairId === card.pairId && first.type !== card.type) {
        // ── Match! ──────────────────────────────────────────────────────────
        playSnap()
        setNewMatches([firstUid, uid])
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.uid === firstUid || c.uid === uid ? { ...c, matched: true } : c
          ))
          setFlipped([])
          setNewMatches([])
        }, 420)
      } else {
        // ── Errou ───────────────────────────────────────────────────────────
        setChecking(true)
        setWrongUids([firstUid, uid])
        playQuizWrong()
        setTimeout(() => {
          setFlipped([])
          setWrongUids([])
          setChecking(false)
        }, 900)
      }
    }
  }, [checking, flipped, cards])

  const stars = starsFor(moves, actualPairs)

  // ── Tela de conclusão ────────────────────────────────────────────────────────
  if (complete) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1,
        background: isKids
          ? 'linear-gradient(170deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)'
          : 'linear-gradient(170deg, #1c0a3d 0%, #2d1060 50%, #1a1040 100%)',
        padding: '32px 24px', gap: 18,
      }}>
        <style>{MEMORY_CSS}</style>
        <div style={{ fontSize: 80, lineHeight: 1, animation: 'mem-complete-pop 0.55s cubic-bezier(0.34,1.56,0.64,1)' }}>
          🎉
        </div>
        <div style={{ textAlign: 'center', animation: 'mem-complete-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.10s both' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: isKids ? '#92400e' : '#e9d5ff', marginBottom: 6 }}>
            Você lembrou tudo!
          </div>
          <div style={{ fontSize: 13, color: isKids ? 'rgba(120,60,0,0.65)' : 'rgba(196,181,253,0.65)' }}>
            {actualPairs} pares em {moves} tentativa{moves !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 10,
          animation: 'mem-complete-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.20s both',
        }}>
          {[1, 2, 3].map(n => (
            <span key={n} style={{
              fontSize: 44,
              filter: n <= stars ? 'none' : 'grayscale(1) opacity(0.22)',
              animation: n <= stars ? `mem-complete-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.25 + n * 0.10}s both` : undefined,
            }}>⭐</span>
          ))}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: isKids ? 'rgba(120,60,0,0.55)' : 'rgba(196,181,253,0.50)',
          animation: 'mem-complete-pop 0.4s ease 0.55s both',
        }}>
          {stars === 3 ? '🧠 Memória perfeita!' : stars === 2 ? '👏 Muito bem!' : '💪 Continue praticando!'}
        </div>
        <button onClick={onDone} style={{
          marginTop: 8, padding: '15px 44px', borderRadius: 18, border: 'none',
          background: isKids
            ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
            : 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: isKids ? '#2D1F6B' : '#fff',
          fontSize: 17, fontWeight: 900, cursor: 'pointer',
          boxShadow: isKids ? '0 5px 0 #b45309' : '0 5px 0 #4c1d95',
          WebkitTapHighlightColor: 'transparent',
          animation: 'mem-complete-pop 0.4s ease 0.65s both',
        }}>Voltar</button>
      </div>
    )
  }

  // ── Tela do jogo ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      background: isKids
        ? 'linear-gradient(170deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)'
        : 'linear-gradient(170deg, #1c0a3d 0%, #2d1060 50%, #1a1040 100%)',
      padding: '16px 16px 24px', gap: 12,
      overflowY: 'auto', alignItems: 'center',
    }}>
      <style>{MEMORY_CSS}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', maxWidth:420 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color: isKids ? '#92400e' : '#e9d5ff' }}>
            🃏 Memory
          </div>
          <div style={{ fontSize:11, color: isKids ? 'rgba(120,60,0,0.55)' : 'rgba(196,181,253,0.55)' }}>
            {matchedCount}/{actualPairs} pares · {moves} tentativas
          </div>
        </div>
        <button onClick={onDone} style={{
          background:'none', border:'none', fontSize:13, cursor:'pointer', padding:'6px 10px',
          color: isKids ? 'rgba(120,60,0,0.45)' : 'rgba(196,181,253,0.40)',
        }}>Sair</button>
      </div>

      {/* Barra de progresso */}
      <div style={{
        height:6, borderRadius:99, overflow:'hidden', width:'100%', maxWidth:420,
        background: isKids ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)',
      }}>
        <div style={{
          height:'100%', borderRadius:99,
          width:`${(matchedCount / actualPairs) * 100}%`,
          background: isKids
            ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
            : 'linear-gradient(90deg,#7c3aed,#a78bfa)',
          transition:'width 0.5s cubic-bezier(0.34,1.2,0.64,1)',
          boxShadow: isKids ? '0 0 8px rgba(251,191,36,0.60)' : '0 0 8px rgba(167,139,250,0.50)',
        }} />
      </div>

      {/* Legenda */}
      <div style={{
        textAlign:'center', fontSize:12,
        color: isKids ? 'rgba(120,60,0,0.50)' : 'rgba(196,181,253,0.45)',
      }}>
        {isKids ? '🔍 Une o emoji com a palavra em inglês' : 'Una o emoji com a palavra em inglês'}
      </div>

      {/* Grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns: isKids
          ? 'repeat(3, minmax(82px, 115px))'
          : 'repeat(4, minmax(62px, 92px))',
        gap: isKids ? 14 : 10,
        justifyContent:'center',
        width:'100%',
      }}>
        {cards.map(card => (
          <Card
            key={card.uid}
            card={card}
            flipped={flipped.includes(card.uid)}
            isKids={isKids}
            onClick={() => handleFlip(card.uid)}
            isWrong={wrongUids.includes(card.uid)}
            isNewMatch={newMatches.includes(card.uid)}
          />
        ))}
      </div>
    </div>
  )
}
