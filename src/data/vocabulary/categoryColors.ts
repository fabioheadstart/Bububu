export interface CategoryColor {
  bg: string          // chip background
  glow: string        // box-shadow glow
  ring: string        // hint pulse ring + COMBO! text color
  overlayFrom: string // combo overlay radial gradient center
  label: string       // display name pt-BR
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  food:       { bg: '#059669', glow: 'rgba(52,211,153,0.50)',  ring: '#34d399', overlayFrom: 'rgba(16,185,129,0.50)', label: 'comida'     },
  actions:    { bg: '#1d4ed8', glow: 'rgba(96,165,250,0.50)',  ring: '#60a5fa', overlayFrom: 'rgba(59,130,246,0.50)', label: 'ações'      },
  adjectives: { bg: '#6d28d9', glow: 'rgba(167,139,250,0.50)', ring: '#a78bfa', overlayFrom: 'rgba(109,40,217,0.50)', label: 'adjetivos'  },
  body:       { bg: '#be123c', glow: 'rgba(251,113,133,0.50)', ring: '#fb7185', overlayFrom: 'rgba(225,29,72,0.50)',  label: 'corpo'      },
  family:     { bg: '#b45309', glow: 'rgba(251,191,36,0.50)',  ring: '#fbbf24', overlayFrom: 'rgba(217,119,6,0.50)', label: 'família'    },
  home:       { bg: '#c2410c', glow: 'rgba(251,146,60,0.50)',  ring: '#fb923c', overlayFrom: 'rgba(234,88,12,0.50)', label: 'casa'       },
  time:       { bg: '#0e7490', glow: 'rgba(34,211,238,0.50)',  ring: '#22d3ee', overlayFrom: 'rgba(8,145,178,0.50)', label: 'tempo'      },
  transport:  { bg: '#334155', glow: 'rgba(148,163,184,0.50)', ring: '#94a3b8', overlayFrom: 'rgba(71,85,105,0.50)', label: 'transporte' },
  phrases:    { bg: '#0f766e', glow: 'rgba(45,212,191,0.50)',  ring: '#2dd4bf', overlayFrom: 'rgba(20,184,166,0.50)', label: 'expressões'  },
  animals:    { bg: '#15803d', glow: 'rgba(74,222,128,0.50)',  ring: '#4ade80', overlayFrom: 'rgba(22,163,74,0.50)',  label: 'animais'    },
  colors:     { bg: '#9333ea', glow: 'rgba(216,180,254,0.50)', ring: '#d8b4fe', overlayFrom: 'rgba(147,51,234,0.50)', label: 'cores'      },

  // ── A2 ────────────────────────────────────────────────────────────────────
  work:        { bg: '#1e40af', glow: 'rgba(96,165,250,0.50)',  ring: '#60a5fa', overlayFrom: 'rgba(37,99,235,0.50)',  label: 'trabalho'   },
  nature:      { bg: '#166534', glow: 'rgba(134,239,172,0.50)', ring: '#86efac', overlayFrom: 'rgba(22,101,52,0.50)',  label: 'natureza'   },
  feelings:    { bg: '#9f1239', glow: 'rgba(253,164,175,0.50)', ring: '#fda4af', overlayFrom: 'rgba(159,18,57,0.50)',  label: 'sentimentos'},
  shopping:    { bg: '#b45309', glow: 'rgba(252,211,77,0.50)',  ring: '#fcd34d', overlayFrom: 'rgba(180,83,9,0.50)',   label: 'compras'    },
  health:      { bg: '#0369a1', glow: 'rgba(56,189,248,0.50)',  ring: '#38bdf8', overlayFrom: 'rgba(3,105,161,0.50)',  label: 'saúde'      },
  travel:      { bg: '#0c4a6e', glow: 'rgba(14,165,233,0.50)',  ring: '#0ea5e9', overlayFrom: 'rgba(12,74,110,0.50)',  label: 'viagem'     },
  technology:  { bg: '#1e1b4b', glow: 'rgba(129,140,248,0.50)', ring: '#818cf8', overlayFrom: 'rgba(49,46,129,0.50)',  label: 'tecnologia' },

  // ── B1 ────────────────────────────────────────────────────────────────────
  communication: { bg: '#064e3b', glow: 'rgba(52,211,153,0.50)', ring: '#34d399', overlayFrom: 'rgba(6,78,59,0.50)',   label: 'comunicação'},
  career:        { bg: '#312e81', glow: 'rgba(167,139,250,0.50)',ring: '#a78bfa', overlayFrom: 'rgba(49,46,129,0.50)', label: 'carreira'   },
  abstract:      { bg: '#4a1d96', glow: 'rgba(196,181,253,0.50)',ring: '#c4b5fd', overlayFrom: 'rgba(74,29,150,0.50)', label: 'conceitos'  },
  social:        { bg: '#831843', glow: 'rgba(249,168,212,0.50)',ring: '#f9a8d4', overlayFrom: 'rgba(131,24,67,0.50)', label: 'sociedade'  },
}

const FALLBACK: CategoryColor = {
  bg: '#7c3aed', glow: 'rgba(167,139,250,0.50)', ring: '#a78bfa',
  overlayFrom: 'rgba(124,58,237,0.26)', label: '',
}

export function getCategoryColor(category: string): CategoryColor {
  return CATEGORY_COLORS[category] ?? FALLBACK
}
