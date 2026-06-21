/**
 * ipaToBreading — converte IPA britânico para respelling fonético brasuco
 *
 * Objetivo: A1-B1 brasileiro consegue ler e reproduzir a pronúncia sem
 * precisar saber IPA. A sílaba tônica fica em MAIÚSCULAS.
 *
 * Exemplos:
 *   /ˈæp.əl/    → ÉP-el   (apple)
 *   /ˈwɔː.tər/  → UÔ-ter  (water)
 *   /bəˈnɑː.nə/ → be-NÁ-ne (banana)
 *   /dʒuːs/     → DJUS    (juice)
 *   /ˈtʃɪk.ɪn/ → TCHIK-in (chicken)
 *   /raɪs/      → RÁIS    (rice)
 *   /ˈkɒf.i/    → KÓF-i   (coffee)
 */

// Substituições ordenadas do mais longo para o mais curto
// para evitar match parcial (ex: ɔː antes de ɔ)
const SUBS: [RegExp, string][] = [
  // Africadas e fricativas compostas
  [/dʒ/g,  'dj'],
  [/tʃ/g,  'tch'],

  // Vogais longas + r (British English "linking r")
  [/ɔːr/g,  'ôr'],
  [/uːr/g,  'ur'],
  [/iːr/g,  'ir'],
  [/ɑːr/g,  'ar'],
  [/ɜːr/g,  'êr'],
  [/ər/g,   'er'],   // schwa + r (terminações "er", "or", "ar" no britânico)

  // Vogais longas
  [/ɔː/g,  'ô'],
  [/uː/g,  'u'],
  [/iː/g,  'i'],
  [/ɑː/g,  'á'],
  [/ɜː/g,  'ê'],

  // Ditongos
  [/eɪ/g,  'ei'],
  [/aɪ/g,  'ái'],
  [/ɔɪ/g,  'ói'],
  [/aʊ/g,  'áu'],
  [/oʊ/g,  'ou'],
  [/əʊ/g,  'ou'],
  [/ɪə/g,  'iê'],
  [/eər/g, 'êr'],
  [/eə/g,  'ê'],
  [/ʊər/g, 'uêr'],
  [/ʊə/g,  'uê'],

  // Vogais simples
  [/æ/g,   'é'],
  [/ɪ/g,   'i'],
  [/ʊ/g,   'u'],
  [/ɒ/g,   'ó'],
  [/ɔ/g,   'ô'],
  [/ʌ/g,   'â'],
  [/ə/g,   'e'],
  [/ɑ/g,   'á'],
  [/ɛ/g,   'é'],

  // Consoantes que diferem do PT-BR
  [/θ/g,   'th'],
  [/ð/g,   'dh'],
  [/ʃ/g,   'ch'],
  [/ʒ/g,   'j'],
  [/ŋ/g,   'ng'],
  [/ɹ/g,   'r'],
  [/w/g,   'u'],    // /w/ → "u" como em "uóter"
  [/j/g,   'i'],    // /j/ → "i" como em "iélo" (yellow)
]

function convertSyllable(text: string): string {
  let s = text
  for (const [pattern, replacement] of SUBS) {
    s = s.replace(pattern, replacement)
  }
  return s
}

/**
 * Analisa a string IPA em sílabas com marcador de tonicidade.
 * Formato IPA: marcador ˈ precede a sílaba tônica; . separa sílabas.
 */
function parseSyllables(raw: string): { text: string; stressed: boolean }[] {
  // Marca stress com prefixo "1:" e secondary stress com "0:"
  const marked = raw.replace(/ˈ/g, '\x01').replace(/ˌ/g, '\x02')
  const segments = marked.split(/[.\x01\x02]/).filter(s => s.length > 0)

  // Rastreia qual segmento segue um \x01
  const stressFlags: boolean[] = []
  let nextStressed = false
  let si = 0

  for (let i = 0; i < marked.length; i++) {
    const ch = marked[i]
    if (ch === '\x01') { nextStressed = true; continue }
    if (ch === '\x02') { nextStressed = false; continue }
    if (ch === '.') {
      if (si < segments.length) stressFlags[si] = nextStressed
      si++
      nextStressed = false
    }
  }
  // Última sílaba
  if (stressFlags.length < segments.length) {
    stressFlags[segments.length - 1] = nextStressed
  }

  const result = segments.map((text, i) => ({ text, stressed: stressFlags[i] ?? false }))

  // Palavras monossilábicas sem marcador → tônica por default
  if (result.length === 1 && !result[0].stressed) {
    result[0].stressed = true
  }

  return result
}

export function ipaToBreading(ipa: string): string {
  const raw = ipa.replace(/^\/|\/$/g, '').trim()
  if (!raw) return ''

  const syllables = parseSyllables(raw)
  const converted = syllables.map(({ text, stressed }) => {
    const conv = convertSyllable(text)
    return stressed ? conv.toUpperCase() : conv
  })

  return converted.join('-')
}
