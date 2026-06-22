import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'

export function BububuLore() {
  const [open, setOpen] = useState(false)
  const { isKids } = useTheme()

  return (
    <>
      {/* Botão ? — canto inferior esquerdo */}
      <button
        onClick={() => setOpen(true)}
        aria-label="A história do Bububu"
        style={{
          position: 'fixed',
          bottom: 76,
          left: 16,
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: isKids ? '1px solid rgba(45,31,107,0.22)' : '1px solid rgba(255,255,255,0.22)',
          background: isKids ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: isKids ? 'rgba(45,31,107,0.65)' : 'rgba(255,255,255,0.50)',
          fontSize: 13,
          fontWeight: 900,
          cursor: 'pointer',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
          transition: 'opacity 0.2s, background 0.2s',
        }}
        onPointerEnter={e => {
          e.currentTarget.style.background = isKids ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.14)'
          e.currentTarget.style.color = isKids ? 'rgba(45,31,107,0.90)' : 'rgba(255,255,255,0.80)'
        }}
        onPointerLeave={e => {
          e.currentTarget.style.background = isKids ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)'
          e.currentTarget.style.color = isKids ? 'rgba(45,31,107,0.65)' : 'rgba(255,255,255,0.50)'
        }}
      >
        ?
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,0,30,0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 0 80px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              margin: '0 16px',
              background: 'rgba(20,6,55,0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(167,139,250,0.22)',
              borderRadius: 24,
              padding: '28px 24px 24px',
              animation: 'slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
              maxHeight: '78vh',
              overflowY: 'auto',
            }}
          >

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div style={{ fontSize: 38, lineHeight: 1 }}>🫧</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#e9d5ff', lineHeight: 1.1 }}>
                  A história do Bububu
                </div>
                <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.50)', marginTop: 3, letterSpacing: 0.5 }}>
                  São Sebastião do Rio Verde · Minas Gerais
                </div>
              </div>
            </div>

            {/* Origin */}
            <div style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.80,
              display: 'flex',
              flexDirection: 'column',
              gap: 13,
            }}>
              <p style={{ margin: 0 }}>
                Bububu veio de um lugar muito distante — um lugar onde ninguém fala, ninguém escreve, ninguém tem nome para nada.
              </p>
              <p style={{ margin: 0 }}>
                Chegou aqui sem querer. Caiu bem no meio de São Sebastião do Rio Verde, Minas Gerais: uma cidadezinha onde todo mundo se conhece, o queijo é artesanal e a linguiça é de Pouso Alto. Ninguém sabia o que era ele — mas ficaram amigos assim mesmo. 💜
              </p>
              <p style={{ margin: 0 }}>
                Foi aqui que ele descobriu que tudo tem nome. <em>Cachorro. Dog. Sol. Sun.</em>
              </p>
              <p style={{ margin: 0, fontWeight: 700, color: '#c4b5fd' }}>
                E descobriu, principalmente, que palavras em inglês são alimento. Cada uma que ele come vira parte dele — e ele cresce.
              </p>
              <p style={{ margin: 0 }}>
                O problema: ele não consegue buscar palavras sozinho. Precisa de você para isso.
              </p>
            </div>

            {/* Divider */}
            <div style={{ margin: '20px 0', height: 1, background: 'rgba(167,139,250,0.12)' }} />

            {/* Nome */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(196,181,253,0.45)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                De onde vem o nome
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.70 }}>
                O nome <strong style={{ color: '#c4b5fd' }}>Bububu</strong> foi inventado por Paulo Zebra — e ficou, porque nenhum outro nome caberia nele.
              </p>
            </div>

            {/* Divider */}
            <div style={{ margin: '0 0 16px', height: 1, background: 'rgba(167,139,250,0.10)' }} />

            {/* Dedicatória */}
            <p style={{
              margin: 0,
              fontSize: 13,
              color: 'rgba(233,213,255,0.58)',
              fontStyle: 'italic',
              lineHeight: 1.75,
            }}>
              Dedicado ao Miguel, filho de Rogério e Eloisa, que vai aprender inglês junto com o Bububu e ter muito sucesso na vida. 💜
            </p>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 22,
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                border: '1px solid rgba(167,139,250,0.18)',
                background: 'rgba(167,139,250,0.07)',
                color: 'rgba(196,181,253,0.65)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'background 0.15s',
              }}
            >
              fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
