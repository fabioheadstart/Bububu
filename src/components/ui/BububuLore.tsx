import { useState } from 'react'

export function BububuLore() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Pontinho ? */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 76,
          left: 16,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.22)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.45)',
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
          transition: 'opacity 0.2s',
        }}
        onPointerEnter={e => (e.currentTarget.style.opacity = '1')}
        onPointerLeave={e => (e.currentTarget.style.opacity = '0.7')}
      >
        ?
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,0,30,0.72)',
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
              background: 'rgba(30,8,70,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: 24,
              padding: '28px 24px 24px',
              animation: 'slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 36, lineHeight: 1 }}>🫧</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#e9d5ff', lineHeight: 1.1 }}>
                  A história do Bububu
                </div>
                <div style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', marginTop: 2, letterSpacing: 0.5 }}>
                  São Sebastião do Rio Verde, MG
                </div>
              </div>
            </div>

            {/* Story */}
            <div style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.80)',
              lineHeight: 1.75,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <p style={{ margin: 0 }}>
                Bububu nasceu em São Sebastião do Rio Verde, Minas Gerais — uma cidadezinha onde o queijo é artesanal, a linguiça é de sábado, o biscoito de polvilho some em segundos e todo mundo ainda diz bom-dia para quem não conhece.
              </p>
              <p style={{ margin: 0 }}>
                Certa noite, na casa da avó, um televisor velho captou um sinal esquisito. Na tela apareceu um episódio de <em>Friends</em> — em inglês, sem legenda. Era a Rachel Green. Bububu ficou imóvel. Não entendeu uma palavra. Mas o som daquela língua fez algo estranho acontecer no peito dele: pareceu que o mundo era maior do que São Sebastião do Rio Verde.
              </p>
              <p style={{ margin: 0 }}>
                Foi amor. Pelos dois: pela Jennifer Aniston e pelo inglês.
              </p>
              <p style={{ margin: 0 }}>
                Desde então, Bububu tem um único plano: ir para os Estados Unidos, chegar em Hollywood, encontrar Jennifer Aniston e dizer, em inglês perfeito, algo bonito e inteligente.
              </p>
              <p style={{ margin: 0 }}>
                Ele ainda não sabe exatamente o quê. Mas sabe que precisa das palavras primeiro.
              </p>
              <p style={{ margin: 0, fontWeight: 800, color: '#c4b5fd' }}>
                É por isso que ele come palavras.
              </p>
            </div>

            {/* Divider */}
            <div style={{
              margin: '20px 0 16px',
              height: 1,
              background: 'rgba(167,139,250,0.15)',
            }} />

            {/* Dedicatória */}
            <p style={{
              margin: 0,
              fontSize: 13,
              color: 'rgba(233,213,255,0.60)',
              fontStyle: 'italic',
              lineHeight: 1.7,
            }}>
              Dedicado ao Miguel, filho de Rogério e Eloisa, que vai aprender inglês junto com o Bububu e ter muito sucesso na vida. 💜
            </p>

            {/* Divider */}
            <div style={{
              margin: '14px 0',
              height: 1,
              background: 'rgba(167,139,250,0.10)',
            }} />

            {/* Credits */}
            <p style={{
              margin: 0,
              fontSize: 12,
              color: 'rgba(196,181,253,0.35)',
              fontStyle: 'italic',
              lineHeight: 1.6,
            }}>
              Bububu foi criado com carinho e inspirado em Paulo Zebra, que inventou o nome bububu.
            </p>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                border: '1px solid rgba(167,139,250,0.2)',
                background: 'rgba(167,139,250,0.08)',
                color: 'rgba(196,181,253,0.7)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
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
