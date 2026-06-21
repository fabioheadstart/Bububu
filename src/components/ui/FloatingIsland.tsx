// Ilha flutuante onde o Bububu vive

export function FloatingIsland() {
  return (
    <svg
      width="180" height="58"
      viewBox="0 0 220 72"
      style={{ display: 'block', margin: '-4px auto 0', flexShrink: 0 }}
    >
      {/* Sombra / glow embaixo */}
      <ellipse cx="110" cy="66" rx="80" ry="9"
        fill="rgba(109,63,181,0.30)" />

      {/* Corpo da ilha — rocha */}
      <ellipse cx="110" cy="52" rx="86" ry="28" fill="#3b1f6b" />
      <ellipse cx="110" cy="48" rx="80" ry="22" fill="#4c2885" />

      {/* Grama */}
      <ellipse cx="110" cy="30" rx="86" ry="22" fill="#22c55e" />
      <ellipse cx="110" cy="25" rx="76" ry="15" fill="#4ade80" />
      {/* Highlight de grama */}
      <ellipse cx="98"  cy="21" rx="44" ry="8"  fill="rgba(134,239,172,0.50)" />

      {/* Cristais à esquerda */}
      <polygon points="32,28 39,28 35.5,14" fill="#e879f9" />
      <polygon points="44,25 53,25 48.5, 9"  fill="#c026d3" />

      {/* Cristais à direita */}
      <polygon points="181,28 188,28 184.5,14" fill="#e879f9" />
      <polygon points="167,25 176,25 171.5, 9"  fill="#c026d3" />

      {/* Florzinhas */}
      <circle cx="70"  cy="22" r="4.5" fill="#fbbf24" />
      <circle cx="70"  cy="22" r="2"   fill="#fef3c7" />
      <circle cx="150" cy="22" r="4"   fill="#fb7185" />
      <circle cx="150" cy="22" r="1.8" fill="#ffe4e6" />
      <circle cx="92"  cy="18" r="3"   fill="#f472b6" />
      <circle cx="128" cy="19" r="3.5" fill="#fbbf24" />
      <circle cx="128" cy="19" r="1.5" fill="#fef3c7" />
    </svg>
  )
}
