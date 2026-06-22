// Balão de fala do Bububu — aparece, fica 2.8s, some

interface Props {
  text: string | null
  isKids?: boolean
}

export function BububuSpeech({ text, isKids = false }: Props) {
  if (!text) return null

  return (
    <>
      <style>{`
        @keyframes speech-in {
          0%   { opacity: 0; transform: translateY(10px) scale(0.82); filter: blur(4px); }
          18%  { opacity: 1; transform: translateY(-2px) scale(1.04); filter: blur(0); }
          28%  { transform: translateY(0) scale(1); }
          72%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-6px) scale(0.96); }
        }

        .bub-speech-tail-pro::after {
          content: '';
          position: absolute;
          bottom: -9px;
          left: 16px;
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 5px solid transparent;
          border-top: 10px solid rgba(28,8,72,0.98);
        }

        .bub-speech-tail-kids::after {
          content: '';
          position: absolute;
          bottom: -9px;
          left: 16px;
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 5px solid transparent;
          border-top: 10px solid rgba(255,255,255,0.98);
        }
      `}</style>

      <div
        key={text}
        style={{
          position: 'absolute',
          top: '13%',
          left: 'calc(50% + 6px)',
          maxWidth: 'min(178px, calc(50% - 14px))',
          zIndex: 10,
          pointerEvents: 'none',
          animation: 'speech-in 3.0s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      >
        <div
          className={isKids ? 'bub-speech-tail-kids' : 'bub-speech-tail-pro'}
          style={{
            position: 'relative',
            background: isKids
              ? 'rgba(255,255,255,0.98)'
              : 'rgba(28,8,72,0.98)',
            color: isKids ? '#2d1f6b' : '#ede9ff',
            borderRadius: 16,
            padding: '10px 14px 10px 13px',
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.38,
            letterSpacing: 0.1,
            maxWidth: '100%',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isKids
              ? '0 4px 18px rgba(0,0,0,0.18), 0 0 0 1.5px rgba(255,217,61,0.50)'
              : '0 4px 22px rgba(0,0,0,0.50), 0 0 0 1px rgba(167,139,250,0.35), 0 0 14px rgba(124,58,237,0.20)',
          }}
        >
          {text}
        </div>
      </div>
    </>
  )
}
