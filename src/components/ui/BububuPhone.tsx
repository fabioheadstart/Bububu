import { useState, useEffect, useRef } from 'react'
import { getStage } from '@/components/bububu/BububuCharacter'
import { ALL_WORDS } from '@/data/vocabulary'

interface Props {
  open: boolean
  onClose: () => void
  level: number
  wordsLearned: string[]
  streak: number
  userName?: string
  isKids?: boolean
}

const CAT_PT: Record<string, string> = {
  animals:    'animais 🐘',
  food:       'comida 🍕',
  colors:     'cores 🎨',
  home:       'casa 🏠',
  actions:    'ações 💪',
  adjectives: 'adjetivos ✨',
  body:       'corpo 🫀',
  family:     'família 👨‍👩‍👧',
  time:       'tempo ⏰',
  transport:  'transporte 🚗',
  phrases:    'frases 💬',
}

type Msg = { id: number; text: string | React.ReactNode; delay: number }

function buildMessages(
  level: number,
  wordsLearned: string[],
  streak: number,
  userName?: string,
): Msg[] {
  const stage   = getStage(level)
  const count   = wordsLearned.length
  const hour    = new Date().getHours()
  const hi      = hour < 12 ? 'bom dia' : hour < 18 ? 'boa tarde' : 'boa noite'
  const name    = userName ? `, ${userName}` : ''
  const msgs: Msg[] = []
  let d = 0

  // Saudação
  msgs.push({ id: msgs.length, text: `${hi}${name}!! 👋`, delay: d })
  d += 500

  // Self-intro baseado no estágio
  const stageLines: Record<string, string> = {
    baby:    'sou pequenininho ainda 🐣 mas to crescendo todo dia!!',
    growing: 'olha como eu cresci!! 🌱 to ficando mais forte a cada palavra!!',
    teen:    'OLHA A ESTRELA!! ⭐ to jovem agora, graças a você!!',
    adult:   'A COROA!! 👑 me tornei adulto de verdade!! você fez isso!!',
  }
  msgs.push({ id: msgs.length, text: stageLines[stage], delay: d })
  d += 500

  // Contagem de palavras
  if (count === 0) {
    msgs.push({ id: msgs.length, text: 'me dá uma palavra!! to com fome!! 😭', delay: d })
  } else {
    msgs.push({ id: msgs.length, text: `você já me deu ${count} palavra${count !== 1 ? 's' : ''}!! obrigado!! 🥺`, delay: d })
  }
  d += 500

  // Mostra até 3 palavras recentes em contexto
  const recentIds = wordsLearned.slice(-6)
  const recentWords = recentIds
    .map(id => ALL_WORDS.find(w => w.id === id))
    .filter(Boolean)
    .slice(-3)

  if (recentWords.length > 0) {
    msgs.push({ id: msgs.length, text: 'ó as últimas que aprendi com você 👀', delay: d })
    d += 400
    for (const w of recentWords) {
      if (!w) continue
      msgs.push({
        id: msgs.length,
        text: `📚 "${w.word}" → ${w.translation}`,
        delay: d,
      })
      d += 380
    }
  }

  // Streak
  if (streak >= 2) {
    msgs.push({ id: msgs.length, text: `${streak} dias seguidos!! você não me abandona 🥺💜`, delay: d })
    d += 500
  }

  // Arco Vini Jr. / passaporte
  const ending = stage === 'adult'
    ? `com ${count} palavras já chego lá fora com passaporte carimbado 🌍 igual o Vini Jr.!!`
    : 'meu sonho é ir pro mundo e falar inglês de verdade 🌍 igual o Vini Jr. fez!!'
  msgs.push({ id: msgs.length, text: ending, delay: d })
  d += 500

  msgs.push({ id: msgs.length, text: `com você do meu lado, eu chego lá${name}!! 💜`, delay: d })

  return msgs
}

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: color,
          animation: `typing-dot 1.1s ${i * 0.18}s ease-in-out infinite`,
          opacity: 0.5,
        }} />
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function BububuPhone({ open, onClose, level, wordsLearned, streak, userName, isKids = false }: Props) {
  const messages = buildMessages(level, wordsLearned, streak, userName)
  const [revealed, setRevealed] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const accentColor = isKids ? '#4ade80' : '#a78bfa'
  const bubbleBg    = isKids ? 'rgba(22,163,74,0.20)' : 'rgba(124,58,237,0.22)'
  const bubbleBorder= isKids ? 'rgba(74,222,128,0.25)' : 'rgba(167,139,250,0.20)'
  const headerBg    = isKids ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#5b21b6,#4c1d95)'

  // Revela mensagens uma a uma com delay natural
  useEffect(() => {
    if (!open) { setRevealed(0); return }

    function reveal(idx: number) {
      if (idx > messages.length) return
      setRevealed(idx)
      if (idx < messages.length) {
        // delay até próxima: 520–720ms
        timerRef.current = setTimeout(() => reveal(idx + 1), 600 + Math.random() * 120)
      }
    }
    timerRef.current = setTimeout(() => reveal(1), 200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [open, messages.length])

  // Auto-scroll quando nova mensagem aparece
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [revealed])

  if (!open) return null

  const showTyping = revealed > 0 && revealed < messages.length

  return (
    <>
      <style>{`
        @keyframes phone-in {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes msg-pop {
          0%   { opacity: 0; transform: translateY(8px) scale(0.94); }
          60%  { transform: scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typing-dot {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.35; }
          40%            { transform: translateY(-5px); opacity: 1;    }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1;   }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(6,0,20,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 72px',
        }}
      >
        {/* Janela */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 400,
            margin: '0 14px',
            background: '#0c0820',
            borderRadius: 22,
            overflow: 'hidden',
            border: '1px solid rgba(167,139,250,0.15)',
            maxHeight: '74vh',
            display: 'flex', flexDirection: 'column',
            animation: 'phone-in 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 28px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,58,237,0.12)',
          }}
        >
          {/* Header */}
          <div style={{
            background: headerBg,
            padding: '13px 16px 11px',
            display: 'flex', alignItems: 'center', gap: 11,
            flexShrink: 0,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.22)',
            }}>
              🫧
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.2 }}>
                Bububu
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
                  animation: 'dot-pulse 2s ease-in-out infinite',
                }} />
                online agora
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto', background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.75)', fontSize: 16,
                cursor: 'pointer', padding: '5px 10px',
                borderRadius: 8, lineHeight: 1,
                fontWeight: 700,
              }}
            >✕</button>
          </div>

          {/* Mensagens */}
          <div
            ref={scrollRef}
            style={{
              overflowY: 'auto', padding: '14px 14px 12px',
              display: 'flex', flexDirection: 'column', gap: 7,
              flex: 1, minHeight: 0,
            }}
          >
            {messages.slice(0, revealed).map((msg, i) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex', alignItems: 'flex-end', gap: 7,
                  maxWidth: '88%',
                  animation: 'msg-pop 0.30s ease both',
                }}
              >
                {/* Mini avatar só na 1ª de cada bloco */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(124,58,237,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                  visibility: i === 0 || i === revealed - 1 ? 'visible' : 'hidden',
                }}>🫧</div>

                {/* Bolha */}
                <div style={{
                  background: bubbleBg,
                  border: `1px solid ${bubbleBorder}`,
                  borderRadius: '16px 16px 16px 3px',
                  padding: '9px 13px',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.5,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {showTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, maxWidth: '88%' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(124,58,237,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                }}>🫧</div>
                <div style={{
                  background: bubbleBg,
                  border: `1px solid ${bubbleBorder}`,
                  borderRadius: '16px 16px 16px 3px',
                }}>
                  <TypingDots color={accentColor} />
                </div>
              </div>
            )}
          </div>

          {/* Footer — resposta rápida quando termina */}
          {revealed >= messages.length && (
            <div style={{
              padding: '10px 14px 14px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 8,
              flexShrink: 0,
              animation: 'msg-pop 0.3s ease both',
            }}>
              {['💜 Vai lá, Bububu!', '🔥 Vamos juntos!'].map(label => (
                <button
                  key={label}
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 12,
                    border: `1px solid ${bubbleBorder}`,
                    background: bubbleBg,
                    color: 'rgba(255,255,255,0.80)',
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
