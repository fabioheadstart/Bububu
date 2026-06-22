// Falas do Bububu — agrupadas por momento
// Regra: curtas, em português, na voz de um mineiro fofo que come palavras
//
// ATENÇÃO: categorias 'body' e 'family' nunca devem usar templates que incluam
// a palavra diretamente — "adoro um mother", "breast — que delícia" etc. são
// involuntariamente sexuais ou perturbadores. Use SAFE_WITH_WORD_CATS para
// controlar quais categorias podem receber o template com palavra.

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
  'o Vini não deixaria eu passar fome, não',
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

// Categorias onde é SEGURO incluir a palavra no comentário.
// Body e family ficam de fora — "adoro um breast/mother" é inaceitável.
const SAFE_WITH_WORD_CATS = new Set([
  'food', 'actions', 'adjectives', 'time', 'transport',
  'animals', 'nature', 'work', 'play', 'school',
  'friends', 'travel', 'games', 'home', 'phrases',
])

const EAT_WITH_WORD = (word: string) =>
  pick([
    `"${word}" — muito boa!`,
    `${word}... anotado!`,
    `essa eu gostei: ${word}`,
    `${word} é das boas`,
    `"${word}" ficou guardada`,
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
  'essa é de primeira qualidade',
  'palavra gourmet. gosto muito',
  'o Vini Jr. usaria essa em entrevista',
]

// ── Context bonus ──────────────────────────────────────────────────────────────
const EAT_CONTEXT = [
  'essa tem história!',
  'palavra com contexto é gourmet',
  'aprendi bem essa',
  'com frase e tudo? luxo',
]

// ── Mastery ────────────────────────────────────────────────────────────────────
// MASTERY: "faz parte de mim agora" era problemático com body parts.
// Templates com palavra usam aspas + contexto neutro de vocabulário.
const MASTERY_PHRASES = (word: string) =>
  pick([
    `"${word}" gravado pra sempre`,
    `dominei! próxima!`,
    `nunca mais esqueço "${word}"`,
    `aprendi "${word}" de verdade`,
    `"${word}" no banco de dados`,
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
  'VINI JR. AQUI VOU EU!!',
  'ULTRA COMBO! tô voando',
  'isso foi secreto e eu adorei DEMAIS',
  'nunca pensei que ia acontecer isso',
]

// ── Pensamentos aleatórios (idle timer) ───────────────────────────────────────
const THOUGHTS = [
  'o Vini Jr. também começou sem saber inglês. olha onde ele tá',
  'cada palavra é um passo pra fora daqui — no bom sentido',
  'inglês é difícil mas comigo fica gostoso',
  'no inglês tem palavra pra tudo, sabia?',
  'cidade pequena não significa sonho pequeno',
  'pensa: bichinho que come inglês. que ideia boa',
  'continua me alimentando, porfa',
  'quem ouve inglês nas séries já tá na frente — e nem sabe',
  'cada palavra que você me dá é uma palavra que o mundo entende',
  'palavra por palavra, a gente chega lá',
  'tô guardando tudo que você me dá. não desperdiça',
  'São Sebastião pra mundo — esse é o plano',
]

const THOUGHTS_NAMED = (name: string) => [
  `${name}, cada palavra é um passo pra fora daqui`,
  `continua me alimentando, ${name}`,
  `${name}, você tá mais perto do que pensa`,
  `São Sebastião pra mundo — é nós, ${name}`,
  `${name}, o Vini Jr. não parou. você também não para`,
]

// ── Sino da Igreja — dispara às :00 e :30 de cada hora ───────────────────────
const SINO_PHRASES = [
  'bong! o sino tocou. hora de aprender mais uma 🔔',
  'ouviu? é o sino. vamos aproveitar ⛪',
  'meia hora se foi. o que você aprendeu? me alimenta!',
  'o sino chamou. ele tá do nosso lado 🔔',
  'bong bong! São Sebastião acordou. e você?',
  'o sino é pontual. seja como o sino 🔔',
]

const SINO_NAMED = (name: string) => [
  `bong! o sino tocou, ${name}. vamos! 🔔`,
  `${name}, o sino chamou. ele não mente ⛪`,
  `meia hora, ${name}. me alimenta aí 🔔`,
]

// ── API pública ────────────────────────────────────────────────────────────────

// ── Evolução de estágio ────────────────────────────────────────────────────────
const EVOLUTION_PHRASES: Record<string, string[]> = {
  growing: [
    'uai, cresci!',
    'olha o tamanho de mim agora',
    'tô ficando grande!',
    'São Sebastião tá orgulhosa',
  ],
  teen: [
    'uma estrela! merecida',
    'adolescente e bilíngue',
    'nível teen: desbloqueado',
    'tô indo, tô indo!',
  ],
  adult: [
    'A COROA! meu Deus',
    'jovem adulto com coroa. isso é vida',
    'mundo, aqui vou eu',
    'passaporte carimbado. vamos!',
  ],
}

// ── Easter egg bullet time ─────────────────────────────────────────────────────
const BULLET_TIME = ['B · U · B · U · B · U...']

// Frases para quando Bububu come exatamente o que estava com vontade
const EAT_CRAVING = [
  'Era isso! Exatamente o que eu queria! 🤤',
  'Perfeito! Você sabe o que eu gosto 😍',
  'Isso sim! Tô amando 🔥',
  'Aaaah! Que satisfação! 💫',
  'Sabia que você ia me dar isso! 🎯',
  'Minha comida favorita do dia! 😋',
]

export type SpeechTrigger =
  | 'idle_normal'
  | 'idle_hungry'
  | 'eat_normal'
  | 'eat_review'
  | 'eat_jackpot'
  | 'eat_context'
  | 'eat_craving'
  | 'mastery'
  | 'combo_trio'
  | 'combo_vs'
  | 'combo_konami'
  | 'thought'
  | 'evolution'
  | 'bullet_time'
  | 'sino'

export function getBubPhrase(
  trigger: SpeechTrigger,
  word?: string,
  stage?: string,
  category?: string,
  userName?: string,
): string {
  switch (trigger) {
    case 'idle_normal':  return pick(IDLE_NORMAL)
    case 'idle_hungry':  return pick(IDLE_HUNGRY)
    case 'eat_normal': {
      // 35% de chance de incluir o nome da palavra — SÓ em categorias seguras
      const catSafe = !category || SAFE_WITH_WORD_CATS.has(category)
      if (word && catSafe && Math.random() < 0.35) return EAT_WITH_WORD(word)
      return pick(EAT_NORMAL)
    }
    case 'eat_review':   return pick(EAT_REVIEW)
    case 'eat_jackpot':  return pick(EAT_JACKPOT)
    case 'eat_context':  return pick(EAT_CONTEXT)
    case 'eat_craving':  return pick(EAT_CRAVING)
    case 'bullet_time':  return pick(BULLET_TIME)
    case 'mastery':      return word ? MASTERY_PHRASES(word) : pick(EAT_NORMAL)
    case 'combo_trio':   return pick(COMBO_TRIO)
    case 'combo_vs':     return pick(COMBO_VS)
    case 'combo_konami': return pick(COMBO_KONAMI)
    case 'thought':
      // 35% de chance de usar o nome quando disponível
      if (userName && Math.random() < 0.35) return pick(THOUGHTS_NAMED(userName))
      return pick(THOUGHTS)
    case 'evolution':    return stage ? pick(EVOLUTION_PHRASES[stage] ?? EVOLUTION_PHRASES.growing) : 'cresci!'
    case 'sino':
      // 40% de chance de usar o nome no sino
      if (userName && Math.random() < 0.40) return pick(SINO_NAMED(userName))
      return pick(SINO_PHRASES)
  }
}
