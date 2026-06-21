// Falas do Bububu — agrupadas por momento
// Regra: curtas, em português, na voz de um mineiro fofo que come palavras

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Idle / fome ────────────────────────────────────────────────────────────────
const IDLE_NORMAL = [
  'que fome...',
  'vai me dar uma palavrinha?',
  'tô esperando, viu?',
  'palavra boa não tem calorias',
  'hmm... e aí?',
  'tô aqui, ó',
  'pode dar, pode',
  'uai, sumiu?',
  'tô com o estômago vazio',
]

const IDLE_HUNGRY = [
  'socorro',
  'TO MORRENDO DE FOME',
  'esqueceu de mim??',
  'uma palavrinha só, juro',
  'nem biscoito de polvilho tem aqui',
  'Jennifer Aniston não deixaria eu passar fome',
]

// ── Comendo ────────────────────────────────────────────────────────────────────
const EAT_NORMAL = [
  'hmmm, gostoso!',
  'mais!',
  'continua, continua...',
  'tô aquecendo!',
  'não para não',
  'uai, que saboroso',
  'engoliu!',
  'que entrada boa essa',
  'primeira não conta, dá mais',
]

const EAT_WITH_WORD = (word: string) =>
  pick([
    `"${word}" — que delícia`,
    `${word}... engolido!`,
    `gostei dessa: ${word}`,
    `${word} é nutritiva`,
    `adoro um "${word}"`,
  ])

// ── Revisão ────────────────────────────────────────────────────────────────────
const EAT_REVIEW = [
  'ô, essa eu já conheço',
  'você já me deu essa',
  'de novo? tá bom...',
  'essa eu sei, mas pode repetir',
  'família! ela já esteve aqui',
  'revisão é bom também',
]

// ── Jackpot ────────────────────────────────────────────────────────────────────
const EAT_JACKPOT = [
  'ISSO SIM É COMIDA BOA',
  'palavra nativa! melhor que linguiça',
  'QUE COISA BOA ESSA',
  'Jennifer Aniston usaria essa',
  'essa é de primeira qualidade',
  'palavra gourmet. gosto muito',
]

// ── Context bonus ──────────────────────────────────────────────────────────────
const EAT_CONTEXT = [
  'essa tem história!',
  'palavra com contexto é gourmet',
  'aprendi bem essa',
  'com frase e tudo? luxo',
]

// ── Mastery ────────────────────────────────────────────────────────────────────
const MASTERY_PHRASES = (word: string) =>
  pick([
    `"${word}" gravado pra sempre`,
    `dominei! próxima!`,
    `${word} — nunca mais esqueço`,
    `${word} faz parte de mim agora`,
    `gravei "${word}" no coração`,
  ])

// ── Combos ─────────────────────────────────────────────────────────────────────
const COMBO_TRIO = [
  'EI EI EI, trio!',
  'três seguidas! é combo!',
  'três da mesma turma, uai',
  'categoria dominada!',
]

const COMBO_VS = [
  'opostos se atraem!',
  'essa batalha foi boa demais',
  'olha os contrários!',
  'claro que o contrário existe!',
]

const COMBO_KONAMI = [
  'JENNIFER ANISTON AQUI VOU EU!!',
  'ULTRA COMBO! tô voando',
  'isso foi secreto e eu adorei DEMAIS',
  'nunca pensei que ia acontecer isso',
]

// ── Pensamentos aleatórios (idle timer) ───────────────────────────────────────
const THOUGHTS = [
  'será que Jennifer Aniston usa essa palavra?',
  'cada palavra é um passo mais perto de Hollywood',
  'inglês é difícil mas comigo fica gostoso',
  'no inglês tem palavra pra tudo, sabia?',
  'tô crescendo, você tá vendo?',
  'pensa: bichinho que come inglês. que ideia boa',
  'continua me alimentando, porfa',
  'lá em São Sebastião, aprende inglês pela tevê',
  'a Rachel Green também tinha esse brilho nos olhos',
  'palavra por palavra, um dia chego lá',
  'tô aqui guardando o que você me dá',
  'que lugar bom pra aprender esse é',
]

// ── API pública ────────────────────────────────────────────────────────────────

// ── Evolução de estágio ────────────────────────────────────────────────────────
const EVOLUTION_PHRASES: Record<string, string[]> = {
  growing: [
    'uai, cresci!',
    'olha o tamanho de mim agora',
    'tô ficando grande!',
  ],
  teen: [
    'uma estrela! merecida',
    'adolescente e bilíngue',
    'nível teen: desbloqueado',
    'tô quase lá, Jennifer',
  ],
  adult: [
    'A COROA! meu Deus',
    'jovem adulto com coroa. isso é vida',
    'Hollywood, aqui vou eu mesmo',
    'se o Jennifer Aniston me vir assim...',
  ],
}

export type SpeechTrigger =
  | 'idle_normal'
  | 'idle_hungry'
  | 'eat_normal'
  | 'eat_review'
  | 'eat_jackpot'
  | 'eat_context'
  | 'mastery'
  | 'combo_trio'
  | 'combo_vs'
  | 'combo_konami'
  | 'thought'
  | 'evolution'

export function getBubPhrase(
  trigger: SpeechTrigger,
  word?: string,
  stage?: string,
): string {
  switch (trigger) {
    case 'idle_normal':  return pick(IDLE_NORMAL)
    case 'idle_hungry':  return pick(IDLE_HUNGRY)
    case 'eat_normal':
      // 35% de chance de incluir o nome da palavra
      if (word && Math.random() < 0.35) return EAT_WITH_WORD(word)
      return pick(EAT_NORMAL)
    case 'eat_review':   return pick(EAT_REVIEW)
    case 'eat_jackpot':  return pick(EAT_JACKPOT)
    case 'eat_context':  return pick(EAT_CONTEXT)
    case 'mastery':      return word ? MASTERY_PHRASES(word) : pick(EAT_NORMAL)
    case 'combo_trio':   return pick(COMBO_TRIO)
    case 'combo_vs':     return pick(COMBO_VS)
    case 'combo_konami': return pick(COMBO_KONAMI)
    case 'thought':      return pick(THOUGHTS)
    case 'evolution':    return stage ? pick(EVOLUTION_PHRASES[stage] ?? EVOLUTION_PHRASES.growing) : 'cresci!'
  }
}
