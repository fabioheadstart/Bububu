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
}

const FALLBACK: CategoryColor = {
  bg: '#7c3aed', glow: 'rgba(167,139,250,0.50)', ring: '#a78bfa',
  overlayFrom: 'rgba(124,58,237,0.26)', label: '',
}

export function getCategoryColor(category: string): CategoryColor {
  return CATEGORY_COLORS[category] ?? FALLBACK
}
