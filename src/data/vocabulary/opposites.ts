// Pares de opostos — chip mostra o oposto após o aluno alimentar a palavra
// Chip só aparece se a palavra-par existir em ALL_WORDS (seguro adicionar extras)
export const OPPOSITE_PAIRS: Record<string, string> = {
  // temperatura / sensação
  'hot':       'cold',       'cold':      'hot',
  'warm':      'cool',       'cool':      'warm',

  // tamanho / intensidade
  'big':       'small',      'small':     'big',
  'large':     'little',     'little':    'large',
  'long':      'short',      'short':     'long',
  'loud':      'quiet',      'quiet':     'loud',
  'strong':    'weak',       'weak':      'strong',
  'heavy':     'light',      'light':     'heavy',
  'fast':      'slow',       'slow':      'fast',

  // tempo / ordem
  'new':       'old',        'old':       'new',
  'early':     'late',       'late':      'early',
  'before':    'after',      'after':     'before',
  'always':    'never',      'never':     'always',
  'morning':   'night',      'night':     'morning',
  'day':       'night',
  'today':     'tomorrow',   'tomorrow':  'yesterday',  'yesterday': 'today',

  // ação / movimento
  'speak':     'listen',     'listen':    'speak',
  'come':      'go',         'go':        'come',
  'give':      'take',       'take':      'give',
  'buy':       'sell',       'sell':      'buy',
  'open':      'close',      'close':     'open',
  'start':     'finish',     'finish':    'start',
  'win':       'lose',       'lose':      'win',
  'push':      'pull',       'pull':      'push',
  'remember':  'forget',     'forget':    'remember',
  'work':      'play',       'play':      'work',
  'arrive':    'leave',      'leave':     'arrive',
  'ask':       'answer',     'answer':    'ask',
  'love':      'hate',       'hate':      'love',

  // estado / condição
  'happy':     'sad',        'sad':       'happy',
  'sick':      'healthy',    'healthy':   'sick',
  'busy':      'free',       'free':      'busy',
  'hungry':    'full',       'full':      'hungry',
  'clean':     'dirty',      'dirty':     'clean',
  'easy':      'hard',       'hard':      'easy',
  'rich':      'poor',       'poor':      'rich',
  'right':     'wrong',      'wrong':     'right',
  'safe':      'dangerous',  'dangerous': 'safe',
  'awake':     'asleep',     'asleep':    'awake',

  // espaço / posição
  'up':        'down',       'down':      'up',
  'left':      'right',      'right':     'left',
  'inside':    'outside',    'outside':   'inside',
  'near':      'far',        'far':       'near',
  'first':     'last',       'last':      'first',

  // pessoas / papéis
  'man':       'woman',      'woman':     'man',
  'boy':       'girl',       'girl':      'boy',
  'teacher':   'student',    'student':   'teacher',
  'doctor':    'patient',    'patient':   'doctor',

  // natureza / lugares
  'sun':       'moon',       'moon':      'sun',
  'city':      'village',    'village':   'city',
}

// Sinônimos — palavras com significado parecido
export const SYNONYM_PAIRS: Record<string, string> = {
  'big':       'large',      'large':     'big',
  'small':     'little',     'little':    'small',
  'fast':      'quick',      'quick':     'fast',
  'happy':     'glad',       'glad':      'happy',
  'angry':     'mad',        'mad':       'angry',
  'tired':     'sleepy',     'sleepy':    'tired',
  'scared':    'afraid',     'afraid':    'scared',
  'sick':      'ill',        'ill':       'sick',
  'start':     'begin',      'begin':     'start',
  'finish':    'end',        'end':       'finish',
  'speak':     'talk',       'talk':      'speak',
  'look':      'see',        'see':       'look',
  'sad':       'unhappy',    'unhappy':   'sad',
  'smart':     'clever',     'clever':    'smart',
  'beautiful': 'pretty',     'pretty':    'beautiful',
  'rich':      'wealthy',    'wealthy':   'rich',
  'buy':       'purchase',   'purchase':  'buy',
  'help':      'assist',     'assist':    'help',
}
