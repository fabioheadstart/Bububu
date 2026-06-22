import { getStage } from '@/components/bububu/BububuCharacter'
import { ALL_WORDS } from '@/data/vocabulary'

interface Props {
  open: boolean
  onClose: () => void
  level: number
  wordsLearned: string[]
  streak: number
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

function getMessages(level: number, wordsLearned: string[], streak: number) {
  const stage    = getStage(level)
  const count    = wordsLearned.length
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'bom dia!!' : hour < 18 ? 'boa tarde!!' : 'boa noite!!'

  // Descobre última categoria aprendida
  const lastId   = wordsLearned[wordsLearned.length - 1]
  const lastWord = ALL_WORDS.find(w => w.id === lastId)
  const lastCat  = lastWord?.category

  const msgs: { id: number; text: string; delay: number }[] = []

  msgs.push({ id: 1, text: `${greeting} 👋`, delay: 0 })
  msgs.push({ id: 2, text: 'sou o Bububu, nasci em São Sebastião do Rio Verde, em Minas Gerais 🌄', delay: 350 })

  if (stage === 'baby') {
    msgs.push({ id: 3, text: 'to pequenininho ainda... mas to crescendo!! 🐣', delay: 700 })
  } else if (stage === 'growing') {
    msgs.push({ id: 3, text: 'olha como eu cresci!! to ficando mais forte 🌱', delay: 700 })
  } else if (stage === 'teen') {
    msgs.push({ id: 3, text: 'OLHA A ESTRELA no meu cabeção!! ⭐ to jovem agora!!', delay: 700 })
  } else {
    msgs.push({ id: 3, text: 'A COROA!! 👑 me tornei adulto de verdade!!', delay: 700 })
  }

  if (count === 0) {
    msgs.push({ id: 4, text: 'me dá uma palavra!! to com fome!! 😭', delay: 1050 })
  } else {
    msgs.push({ id: 4, text: `você já me deu ${count} palavra${count !== 1 ? 's' : ''}!! obrigado!! 🥺`, delay: 1050 })
  }

  if (lastCat && CAT_PT[lastCat]) {
    msgs.push({ id: 5, text: `a última coisa que aprendi foi sobre ${CAT_PT[lastCat]}!! to amando 😍`, delay: 1400 })
  }

  if (streak >= 2) {
    msgs.push({ id: 6, text: `${streak} dias seguidos me alimentando!! você não me abandona 🥺💜`, delay: 1750 })
  }

  msgs.push({
    id: 7,
    text: stage === 'adult'
      ? `com ${count} palavras já to quase pronto pra Hollywood... a Jennifer Aniston vai ficar sem fala 🌟`
      : 'meu sonho é chegar em Hollywood e dizer uma frase perfeita pra Jennifer Aniston 🌟',
    delay: streak >= 2 ? 2100 : 1750,
  })

  msgs.push({ id: 8, text: 'com você me ajudando, eu chego lá!! 💜', delay: msgs[msgs.length - 1].delay + 350 })

  return msgs
}

export function BububuPhone({ open, onClose, level, wordsLearned, streak, isKids = false }: Props) {
  const messages = getMessages(level, wordsLearned, streak)

  const accentColor = isKids ? '#22c55e' : '#7c3aed'
  const headerBg    = isKids ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #5b21b6, #4c1d95)'

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes notif-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.3); }
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* ── Modal do chat ── */}
      <div
          onClick={() => onClose()}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,0,30,0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 80px',
          }}
        >
          {/* Janela do app */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 400,
              margin: '0 16px',
              background: '#0f0a1e',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid rgba(167,139,250,0.18)',
              maxHeight: '72vh',
              display: 'flex', flexDirection: 'column',
              animation: 'msg-in 0.32s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header estilo app de mensagens */}
            <div style={{
              background: headerBg,
              padding: '14px 18px 12px',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
            }}>
              {/* Avatar Bububu */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.25)',
              }}>
                🫧
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'white', lineHeight: 1.2 }}>
                  Bububu
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  online agora
                </div>
              </div>
              <button
                onClick={() => onClose()}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer',
                  padding: '4px 8px', lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* Área de mensagens */}
            <div style={{
              overflowY: 'auto', padding: '16px 14px 20px',
              display: 'flex', flexDirection: 'column', gap: 8,
              background: 'rgba(255,255,255,0.02)',
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex', alignItems: 'flex-end', gap: 8,
                    animation: `msg-in 0.35s ease ${msg.delay}ms both`,
                    maxWidth: '85%',
                  }}
                >
                  {/* Mini avatar */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(124,58,237,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>🫧</div>

                  {/* Bolha */}
                  <div style={{
                    background: 'rgba(124,58,237,0.22)',
                    border: '1px solid rgba(167,139,250,0.20)',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '9px 13px',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.88)',
                    lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer com hint */}
            <div style={{
              padding: '10px 16px 14px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              toca fora pra fechar
            </div>
          </div>
        </div>
    </>
  )
}
