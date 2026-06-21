import { useProgress } from '@/hooks/useProgress'

export const KIDS_CHIP_COLORS = [
  { bg: '#FF6B6B', shadow: 'rgba(255,107,107,0.45)' },
  { bg: '#FFD93D', shadow: 'rgba(255,217,61,0.45)'  },
  { bg: '#6BCB77', shadow: 'rgba(107,203,119,0.45)' },
  { bg: '#4D96FF', shadow: 'rgba(77,150,255,0.45)'  },
  { bg: '#C77DFF', shadow: 'rgba(199,125,255,0.45)' },
  { bg: '#FF9F43', shadow: 'rgba(255,159,67,0.45)'  },
]

export interface AppTheme {
  isKids:             boolean
  bgGradient:         string
  wordColor:          string
  translationColor:   string
  exampleColor:       string
  xpBadgeBg:         string
  xpBadgeColor:      string
  resultZoneBg:      string
  resultZoneBorder:  string
  resultZoneRadius:  number
}

const PRO_THEME: AppTheme = {
  isKids:            false,
  bgGradient:        'linear-gradient(180deg, #1e0b4b 0%, #3b1f6b 28%, #6d3fb5 55%, #a855f7 78%, #e9d5ff 100%)',
  wordColor:         'white',
  translationColor:  '#fde68a',
  exampleColor:      'rgba(255,255,255,0.62)',
  xpBadgeBg:        'rgba(251,191,36,0.10)',
  xpBadgeColor:     '#fbbf24',
  resultZoneBg:     'transparent',
  resultZoneBorder: 'none',
  resultZoneRadius: 0,
}

const KIDS_THEME: AppTheme = {
  isKids:            true,
  bgGradient:        'linear-gradient(170deg, #87CEEB 0%, #B0E0FF 35%, #B8F5D4 65%, #DDFFD4 100%)',
  wordColor:         '#2D1F6B',
  translationColor:  '#E83A5E',
  exampleColor:      '#555',
  xpBadgeBg:        'rgba(255,159,67,0.15)',
  xpBadgeColor:     '#E07000',
  resultZoneBg:     'rgba(255,255,255,0.88)',
  resultZoneBorder: '2.5px solid #FFD93D',
  resultZoneRadius: 20,
}

export function useTheme(): AppTheme {
  const { progress } = useProgress()
  return progress.mode === 'kids' ? KIDS_THEME : PRO_THEME
}
