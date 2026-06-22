// ── Web Audio — narrativa sonora sequencial ───────────────────────────────────
// Real audio files (ElevenLabs) used when available; synthesis fallback.

type ACtx = typeof AudioContext

function actx(): AudioContext {
  const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: ACtx }).webkitAudioContext
  return new C()
}

function noiseBuffer(ac: AudioContext, seconds: number): AudioBuffer {
  const buf  = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

// ── Real audio file cache ────────────────────────────────────────────────────
const _sfx: Record<string, HTMLAudioElement> = {}

function _sfxLoad(name: string): HTMLAudioElement {
  if (!_sfx[name]) {
    const a = new Audio(`/${name}`)
    a.preload = 'auto'
    _sfx[name] = a
  }
  return _sfx[name]
}

async function _sfxPlay(name: string): Promise<boolean> {
  try {
    const a = _sfxLoad(name)
    a.currentTime = 0
    await a.play()
    return true
  } catch {
    return false
  }
}

;['bub_chomp.mp3','bub_fart4.mp3','bub_fart1.mp3','bub_fart2.mp3','bub_fart3.mp3','bub_burp.mp3',
  'sounds/reward-normal.wav','sounds/reward-bonus.wav','sounds/reward-jackpot.wav',
  'sounds/bububu-normal.wav','sounds/bububu-tired.wav','sounds/bububu-super.wav']
  .forEach(n => _sfxLoad(n))

// ── FM LFO helper (modulates AudioParam frequency — no gain automation conflict) ──
function _fmlfo(ac: AudioContext, target: AudioParam, rate: number, depth: number, t0: number, t1: number) {
  const l = ac.createOscillator(); const lg = ac.createGain()
  l.type = 'sine'; l.frequency.value = rate; lg.gain.value = depth
  l.connect(lg); lg.connect(target)
  l.start(t0); l.stop(t1)
}

// ── Noise source helper ──────────────────────────────────────────────────────
function _noise(ac: AudioContext, dur: number) {
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac, dur)
  return src
}

// 1. WHOOSH — chip voando pra boca
export function playWhoosh() {
  try {
    const ac  = actx()
    const osc = ac.createOscillator()
    const g   = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1600, ac.currentTime + 0.32)
    g.gain.setValueAtTime(0, ac.currentTime)
    g.gain.linearRampToValueAtTime(0.22, ac.currentTime + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.36)
    osc.connect(g); g.connect(ac.destination)
    osc.start(); osc.stop(ac.currentTime + 0.38)
    setTimeout(() => ac.close(), 700)
  } catch {}
}

// 2. SNAP — chip entrou na boca
export function playSnap() {
  try {
    const ac  = actx()
    const src = _noise(ac, 0.06)
    const hp  = ac.createBiquadFilter()
    hp.type   = 'highpass'; hp.frequency.value = 1200
    const g   = ac.createGain()
    g.gain.setValueAtTime(0.7, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.055)
    src.connect(hp); hp.connect(g); g.connect(ac.destination)
    src.start(); src.stop(ac.currentTime + 0.06)
    setTimeout(() => ac.close(), 300)
  } catch {}
}

// 3. MONSTER MUNCH — real audio preferred, FM synthesis fallback
function _chompSynth() {
  const ac = actx(); const t = ac.currentTime

  function oneChomp(at: number) {
    // Jaw close — sawtooth + FM mandible vibration
    const osc = ac.createOscillator(); osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(185, at)
    osc.frequency.exponentialRampToValueAtTime(62, at + 0.14)
    _fmlfo(ac, osc.frequency, 35, 28, at, at + 0.14)
    const og = ac.createGain()
    og.gain.setValueAtTime(0.58, at)
    og.gain.exponentialRampToValueAtTime(0.001, at + 0.17)
    osc.connect(og); og.connect(ac.destination)
    osc.start(at); osc.stop(at + 0.18)
    // Crunch transient
    const s1 = _noise(ac, 0.08)
    const bp1 = ac.createBiquadFilter(); bp1.type = 'bandpass'; bp1.frequency.value = 1400; bp1.Q.value = 2.2
    const ng1 = ac.createGain()
    ng1.gain.setValueAtTime(0.58, at); ng1.gain.exponentialRampToValueAtTime(0.001, at + 0.07)
    s1.connect(bp1); bp1.connect(ng1); ng1.connect(ac.destination)
    s1.start(at); s1.stop(at + 0.08)
    // Wet squish
    const s2 = _noise(ac, 0.10)
    const bp2 = ac.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 500; bp2.Q.value = 1.5
    const ng2 = ac.createGain()
    ng2.gain.setValueAtTime(0, at + 0.025)
    ng2.gain.linearRampToValueAtTime(0.35, at + 0.06)
    ng2.gain.exponentialRampToValueAtTime(0.001, at + 0.12)
    s2.connect(bp2); bp2.connect(ng2); ng2.connect(ac.destination)
    s2.start(at); s2.stop(at + 0.12)
  }

  oneChomp(t); oneChomp(t + 0.32); oneChomp(t + 0.64)
  setTimeout(() => ac.close(), 1400)
}

export function playMunch() {
  // Synth sempre executa — garante som em qualquer ambiente
  _chompSynth()
  // Arquivo real em cima do synth se disponível (mais rico)
  _sfxPlay('bub_chomp.mp3').catch(() => {})
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. FART SYNTHESIS — noise-based resonant bandpass (realistic, not robotic)
// Key insight: real farts = air through narrow passage → resonant cavity.
// Model: noise → sweeping narrow bandpass → irregular pulse AM → envelope
// ══════════════════════════════════════════════════════════════════════════════

let _fartCount = 0

// Core fart layer: noise filtered through sweeping resonant bandpass
function _fartLayer(
  ac: AudioContext,
  dur: number,
  freqStart: number,
  freqEnd: number,
  q: number,
  vol: number,
  now: number
): GainNode {
  const src = _noise(ac, dur + 0.05)
  const bp  = ac.createBiquadFilter()
  bp.type = 'bandpass'; bp.Q.value = q
  bp.frequency.setValueAtTime(freqStart, now)
  bp.frequency.exponentialRampToValueAtTime(freqEnd, now + dur)
  const g = ac.createGain(); g.gain.value = vol
  src.connect(bp); bp.connect(g)
  src.start(now); src.stop(now + dur + 0.05)
  return g
}

// Irregular flutter: rapid gain oscillation via chained short noise bursts
// (avoids LFO→gain conflict by using a separate gain node per burst)
function _flutter(ac: AudioContext, input: AudioNode, rate: number, depth: number, now: number, dur: number): GainNode {
  const out = ac.createGain(); out.gain.value = 1 - depth
  input.connect(out)
  // LFO drives a SEPARATE gain node not automated elsewhere
  const lfo = ac.createOscillator(); const lg = ac.createGain()
  lfo.type = 'sine'; lfo.frequency.value = rate; lg.gain.value = depth
  lfo.connect(lg); lg.connect(out.gain)
  lfo.start(now); lfo.stop(now + dur)
  return out
}

// ── 1. Clássico Brrrt — médio, flutter 28Hz (0.55s) ─────────────────────────
function _fartClassic(ac: AudioContext) {
  const now = ac.currentTime; const dur = 0.55
  // Main resonant layer: 180→85Hz, Q=9 (tight = more "body")
  const main = _fartLayer(ac, dur, 180, 85, 9, 1.0, now)
  // Overtone layer: 2x freq, softer
  const over = _fartLayer(ac, dur, 340, 165, 5, 0.35, now)
  // Noise breath layer: wide band, low volume
  const air  = _fartLayer(ac, dur, 260, 130, 1.2, 0.20, now)

  const mix = ac.createGain(); mix.gain.value = 1
  main.connect(mix); over.connect(mix); air.connect(mix)

  // Flutter via separate gain node (no automation conflict)
  const fl = _flutter(ac, mix, 28, 0.42, now, dur)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(0.90, now + 0.025)
  env.gain.setValueAtTime(0.90, now + 0.38)
  env.gain.exponentialRampToValueAtTime(0.001, now + dur)
  fl.connect(env); env.connect(ac.destination)
  setTimeout(() => ac.close(), 900)
}

// ── 2. Squeaker — agudo, rápido, tipo borracha (0.25s) ───────────────────────
function _fartSqueaker(ac: AudioContext) {
  const now = ac.currentTime; const dur = 0.25
  // High resonant squeak: 480→220Hz
  const main = _fartLayer(ac, dur, 480, 220, 14, 1.0, now)
  const fl = _flutter(ac, main, 48, 0.55, now, dur)
  const env = ac.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(0.85, now + 0.006)
  env.gain.exponentialRampToValueAtTime(0.001, now + dur)
  fl.connect(env); env.connect(ac.destination)
  setTimeout(() => ac.close(), 600)
}

// ── 3. O Profundo — grave, longo, trovoada (0.75s) ───────────────────────────
function _fartDeep(ac: AudioContext) {
  const now = ac.currentTime; const dur = 0.75
  // Very low resonant: 95→42Hz
  const main = _fartLayer(ac, dur, 95, 42, 11, 1.0, now)
  // Sub-bass rumble
  const sub  = _fartLayer(ac, dur, 75, 35, 7, 0.55, now)
  // Higher body
  const body = _fartLayer(ac, dur, 190, 80, 4, 0.28, now)

  const mix = ac.createGain(); mix.gain.value = 1
  main.connect(mix); sub.connect(mix); body.connect(mix)

  const fl = _flutter(ac, mix, 14, 0.30, now, dur)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(0.95, now + 0.045)
  env.gain.setValueAtTime(0.95, now + 0.52)
  env.gain.exponentialRampToValueAtTime(0.001, now + dur)
  fl.connect(env); env.connect(ac.destination)
  setTimeout(() => ac.close(), 1100)
}

// ── 4. Metralhadora — 5 estouros irregulares (0.52s) ─────────────────────────
function _fartMachineGun(ac: AudioContext) {
  const now = ac.currentTime
  // Irregular timing for more organic feel
  const timings = [0, 0.078, 0.148, 0.235, 0.318]
  const freqs   = [210, 185, 165, 148, 130]
  timings.forEach((offset, i) => {
    const t = now + offset; const d = 0.065
    const layer = _fartLayer(ac, d, freqs[i], freqs[i] * 0.58, 10, 1.0, t)
    const env = ac.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.82, t + 0.005)
    env.gain.exponentialRampToValueAtTime(0.001, t + d)
    layer.connect(env); env.connect(ac.destination)
  })
  setTimeout(() => ac.close(), 800)
}

// ── 5. Molhadinho — duplo flutter, úmido e irregular (0.65s) ────────────────
function _fartWet(ac: AudioContext) {
  const now = ac.currentTime; const dur = 0.65
  // Primary: low-mid
  const main = _fartLayer(ac, dur, 145, 62, 10, 1.0, now)
  // Wet bubble layer: slightly delayed
  const wet  = _fartLayer(ac, dur - 0.05, 200, 88, 13, 0.50, now + 0.02)
  // Sub rumble
  const sub  = _fartLayer(ac, dur, 85, 38, 6, 0.38, now)

  const mix = ac.createGain(); mix.gain.value = 1
  main.connect(mix); wet.connect(mix); sub.connect(mix)

  // Double flutter = irregular warble
  const fl1 = _flutter(ac, mix, 22, 0.35, now, dur)
  const fl2 = _flutter(ac, fl1, 7, 0.18, now, dur)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(0.92, now + 0.020)
  env.gain.setValueAtTime(0.92, now + 0.45)
  env.gain.exponentialRampToValueAtTime(0.001, now + dur)
  fl2.connect(env); env.connect(ac.destination)
  setTimeout(() => ac.close(), 1000)
}

// ── ARROTO — noise vocal descendo (0.40s) ────────────────────────────────────
function _burpSynth() {
  const ac = actx(); const now = ac.currentTime; const dur = 0.40
  // Vocal cavity resonance: 260→95Hz, high Q = "throat"
  const main = _fartLayer(ac, dur, 260, 95, 8, 1.0, now)
  // Second formant (nasality)
  const f2   = _fartLayer(ac, dur, 520, 190, 5, 0.30, now)

  const mix = ac.createGain(); mix.gain.value = 1
  main.connect(mix); f2.connect(mix)

  // Slow flutter = vocal vibrato
  const fl = _flutter(ac, mix, 9, 0.22, now, dur)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(0.88, now + 0.010)
  env.gain.setValueAtTime(0.88, now + 0.24)
  env.gain.exponentialRampToValueAtTime(0.001, now + dur)
  fl.connect(env); env.connect(ac.destination)
  setTimeout(() => ac.close(), 700)
}

const _FART_SYNTHS = [_fartClassic, _fartSqueaker, _fartDeep, _fartMachineGun, _fartWet]
const _FART_FILES  = ['sounds/reward-normal.wav', 'bub_fart1.mp3', 'bub_fart2.mp3', 'bub_fart3.mp3']

export function playFartBonus(): void {
  _sfxPlay('sounds/reward-bonus.wav').then(ok => {
    if (!ok) _fartClassic(actx())
  }).catch(() => _fartClassic(actx()))
}

export function playFart(): 'fart' | 'burp' {
  _fartCount++
  if (_fartCount % 5 === 0) {
    _sfxPlay('bub_burp.mp3').then(ok => { if (!ok) _burpSynth() }).catch(_burpSynth)
    return 'burp'
  }
  const file = _FART_FILES[Math.floor(Math.random() * _FART_FILES.length)]
  _sfxPlay(file).then(ok => {
    if (!ok) {
      const fn = _FART_SYNTHS[Math.floor(Math.random() * _FART_SYNTHS.length)]
      fn(actx())
    }
  }).catch(() => {
    const fn = _FART_SYNTHS[Math.floor(Math.random() * _FART_SYNTHS.length)]
    fn(actx())
  })
  return 'fart'
}

// ── COINS ─────────────────────────────────────────────────────────────────────

export function playCoinNormal() {
  try {
    const ac = actx(); let t = ac.currentTime
    for (const [f, dur, vol] of [[988, 0.12, 0.32], [1319, 0.14, 0.35]] as [number, number, number][]) {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, t + dur)
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.01)
      t += 0.09
    }
    setTimeout(() => ac.close(), 600)
  } catch {}
}

export function playCoinBonus() {
  try {
    const ac = actx(); let t = ac.currentTime
    for (const f of [988, 1319, 1568]) {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.38, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.15)
      t += 0.10
    }
    setTimeout(() => ac.close(), 800)
  } catch {}
}

export function playCoinJackpot() {
  try {
    const ac = actx(); let t = ac.currentTime
    for (const [f, i] of ([523, 659, 784, 1047] as number[]).map((f, i) => [f, i] as [number, number])) {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = i === 3 ? 'sine' : 'triangle'; o.frequency.value = f
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, t + (i === 3 ? 0.35 : 0.18))
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (i === 3 ? 0.36 : 0.19))
      t += 0.13
    }
    setTimeout(() => ac.close(), 1400)
  } catch {}
}

export function playLevelUp() {
  try {
    const ac = actx(); let t = ac.currentTime
    ;([523, 659, 784, 1047, 1319] as number[]).forEach((f, i, arr) => {
      const isLast = i === arr.length - 1
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(isLast ? 0.55 : 0.32, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, t + (isLast ? 0.70 : 0.13))
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (isLast ? 0.72 : 0.14))
      if (!isLast) t += 0.10
    })
    setTimeout(() => ac.close(), 2000)
  } catch {}
}

export function playReveal() {
  try {
    const ac = actx(); let t = ac.currentTime
    ;([[520, 0.07, 0.22], [820, 0.10, 0.28]] as [number, number, number][]).forEach(([f, dur, vol]) => {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.001, t + dur)
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur)
      t += dur * 0.6
    })
    setTimeout(() => ac.close(), 1000)
  } catch {}
}

export function playComboTrio() {
  try {
    const ac = actx()
    const t  = ac.currentTime
    const steps: [number, number, number][] = [
      [523,  0,    0.13],
      [659,  0.09, 0.13],
      [784,  0.18, 0.13],
      [1047, 0.27, 0.40],
    ]
    steps.forEach(([f, delay, dur]) => {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'triangle'; o.frequency.value = f
      const st = t + delay
      g.gain.setValueAtTime(0, st)
      g.gain.linearRampToValueAtTime(0.42, st + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, st + dur)
      o.connect(g); g.connect(ac.destination)
      o.start(st); o.stop(st + dur + 0.01)
    })
    ;[1047, 1319, 1568].forEach(f => {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0, t + 0.27)
      g.gain.linearRampToValueAtTime(0.18, t + 0.28)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.68)
      o.connect(g); g.connect(ac.destination)
      o.start(t + 0.27); o.stop(t + 0.70)
    })
    setTimeout(() => ac.close(), 1200)
  } catch {}
}

export function playComboVS() {
  try {
    const ac  = actx()
    const now = ac.currentTime
    const zap = ac.createBufferSource()
    zap.buffer = noiseBuffer(ac, 0.12)
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3200
    const zg = ac.createGain()
    zg.gain.setValueAtTime(0.75, now)
    zg.gain.exponentialRampToValueAtTime(0.001, now + 0.10)
    zap.connect(hp); hp.connect(zg); zg.connect(ac.destination)
    zap.start(now); zap.stop(now + 0.13)
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(90, now + 0.02)
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.32)
    const bg = ac.createGain()
    bg.gain.setValueAtTime(0, now + 0.02)
    bg.gain.linearRampToValueAtTime(0.88, now + 0.04)
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
    osc.connect(bg); bg.connect(ac.destination)
    osc.start(now + 0.02); osc.stop(now + 0.34)
    const cr = ac.createBufferSource()
    cr.buffer = noiseBuffer(ac, 0.22)
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 2
    const cg = ac.createGain()
    cg.gain.setValueAtTime(0.32, now)
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    cr.connect(bp); bp.connect(cg); cg.connect(ac.destination)
    cr.start(now); cr.stop(now + 0.23)
    setTimeout(() => ac.close(), 700)
  } catch {}
}

export function playKonami() {
  try {
    const ac = actx()
    const t  = ac.currentTime
    const imp = ac.createBufferSource()
    imp.buffer = noiseBuffer(ac, 0.15)
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700
    const ig = ac.createGain()
    ig.gain.setValueAtTime(0.95, t)
    ig.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    imp.connect(lp); lp.connect(ig); ig.connect(ac.destination)
    imp.start(t); imp.stop(t + 0.16)
    const chord: [number, OscillatorType, number, number][] = [
      [261, 'sawtooth', 0.28, 1.6],
      [330, 'sawtooth', 0.28, 1.6],
      [392, 'sawtooth', 0.26, 1.6],
      [523, 'triangle', 0.24, 1.6],
      [659, 'sine',     0.20, 1.2],
      [784, 'sine',     0.16, 1.0],
      [1047,'sine',     0.12, 0.8],
    ]
    chord.forEach(([freq, type, vol, hold]) => {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = type; o.frequency.value = freq
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(vol, t + 0.02)
      g.gain.setValueAtTime(vol, t + hold)
      g.gain.exponentialRampToValueAtTime(0.001, t + hold + 0.9)
      o.connect(g); g.connect(ac.destination)
      o.start(t); o.stop(t + hold + 0.95)
    })
    const gl = ac.createOscillator()
    gl.type = 'sine'
    gl.frequency.setValueAtTime(261, t + 1.8)
    gl.frequency.exponentialRampToValueAtTime(2093, t + 2.5)
    const gg = ac.createGain()
    gg.gain.setValueAtTime(0, t + 1.8)
    gg.gain.linearRampToValueAtTime(0.38, t + 1.85)
    gg.gain.exponentialRampToValueAtTime(0.001, t + 2.6)
    gl.connect(gg); gg.connect(ac.destination)
    gl.start(t + 1.8); gl.stop(t + 2.65)
    setTimeout(() => ac.close(), 4000)
  } catch {}
}

export function playGroggyBububu(): void {
  _sfxPlay('sounds/bububu-tired.wav').then(ok => {
    if (ok) return
    try {
      const audio = new Audio('/audio/bububu.mp3')
      audio.playbackRate = 0.62
      audio.volume = 0.9
      audio.play().catch(() => {})
    } catch { /* silencioso */ }
  }).catch(() => {})
}

export function playBububuSuper(): void {
  _sfxPlay('sounds/bububu-super.wav').catch(() => {
    try {
      const audio = new Audio('/audio/bububu.mp3')
      audio.playbackRate = 1.3
      audio.volume = 1.0
      audio.play().catch(() => {})
    } catch { /* silencioso */ }
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// SUPER PEIDO — ElevenLabs SFX (primário) + mega synth (fallback)
// Dispara apenas no jackpot (10% de chance). Cinematográfico, alto, memorável.
// ══════════════════════════════════════════════════════════════════════════════

let _jackpotFartUrl: string | null = null
let _jackpotFartLoading = false

/** Chama ElevenLabs Sound Generation API e cacheia como blob URL.
 *  Deve ser chamado no mount do app; silencioso se não houver chave. */
export async function preloadJackpotFart(): Promise<void> {
  const apiKey = (import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined)
  if (!apiKey || _jackpotFartUrl || _jackpotFartLoading) return
  _jackpotFartLoading = true
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: 'an extremely loud, long, wet, resonant fart sound effect — comically disgusting, almost cinematic',
        duration_seconds: 2.5,
        prompt_influence: 0.3,
      }),
    })
    if (res.ok) {
      _jackpotFartUrl = URL.createObjectURL(await res.blob())
      const preload = new Audio(_jackpotFartUrl)
      preload.preload = 'auto'
      preload.load()
    }
  } catch { /* silencioso — fallback para synth */ }
  _jackpotFartLoading = false
}

// Mega synth: todas as 5 camadas simultâneas, gain alto, 1.8s
function _fartMegaSynth(): void {
  try {
    const ac = actx(); const now = ac.currentTime; const dur = 1.8

    const d1 = _fartLayer(ac, dur,        95,  35, 11, 1.2, now)
    const d2 = _fartLayer(ac, dur - 0.2, 180,  75,  9, 1.0, now + 0.08)
    const d3 = _fartLayer(ac, dur - 0.4, 360, 150,  5, 0.7, now + 0.05)
    const d4 = _fartLayer(ac, 0.55,      200,  88, 13, 0.9, now + 0.65)
    const d5 = _fartLayer(ac, 0.35,      480, 200, 14, 0.7, now + 1.40)

    const mix = ac.createGain(); mix.gain.value = 1
    d1.connect(mix); d2.connect(mix); d3.connect(mix); d4.connect(mix); d5.connect(mix)

    const fl = _flutter(ac, mix, 18, 0.40, now, dur)

    const env = ac.createGain()
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(1.4, now + 0.04)
    env.gain.setValueAtTime(1.4, now + 1.2)
    env.gain.exponentialRampToValueAtTime(0.001, now + dur)
    fl.connect(env); env.connect(ac.destination)

    setTimeout(() => ac.close(), Math.ceil(dur * 1000) + 500)
  } catch {}
}

/** Toca o peido do jackpot — arquivo local → ElevenLabs cached → mega synth. */
export function playFartJackpot(): void {
  _sfxPlay('sounds/reward-jackpot.wav').then(ok => {
    if (ok) return
    if (_jackpotFartUrl) {
      try {
        const a = new Audio(_jackpotFartUrl)
        a.volume = 1.0
        a.play().catch(() => _fartMegaSynth())
        return
      } catch { /* fallthrough */ }
    }
    _fartMegaSynth()
  }).catch(() => _fartMegaSynth())
}


// ─── Present pop — estouro do presente (tap to reveal) ──────────────────────
// Cork pop + whoosh up + shimmer: satisfatório e imediato
export function playPresentPop(): void {
  try {
    const ac  = actx()
    const now = ac.currentTime

    // 1. Cork pop — ruído impulsivo com filtro (ataque em <5ms)
    const pop = ac.createBufferSource()
    pop.buffer = noiseBuffer(ac, 0.08)
    const popLp = ac.createBiquadFilter(); popLp.type = 'lowpass'; popLp.frequency.value = 2200
    const popG  = ac.createGain()
    popG.gain.setValueAtTime(1.2, now)
    popG.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    pop.connect(popLp); popLp.connect(popG); popG.connect(ac.destination)
    pop.start(now); pop.stop(now + 0.08)

    // 2. Whoosh ascendente — sine 200→1800Hz em 0.18s
    const whoosh = ac.createOscillator(); whoosh.type = 'sine'
    whoosh.frequency.setValueAtTime(200, now + 0.01)
    whoosh.frequency.exponentialRampToValueAtTime(1800, now + 0.19)
    const whooshG = ac.createGain()
    whooshG.gain.setValueAtTime(0, now + 0.01)
    whooshG.gain.linearRampToValueAtTime(0.28, now + 0.04)
    whooshG.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
       whoosh.connect(whooshG); whooshG.connect(ac.destination)
    whoosh.start(now + 0.01); whoosh.stop(now + 0.23)

    // 3. Shimmer — 3 sines agudos em sequência rápida (coins/bells feel)
    ;[[1047, 0.10], [1319, 0.16], [1568, 0.21]].forEach(([freq, delay]) => {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0, now + delay)
      g.gain.linearRampToValueAtTime(0.22, now + delay + 0.008)
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12)
      o.connect(g); g.connect(ac.destination)
      o.start(now + delay); o.stop(now + delay + 0.13)
    })

    setTimeout(() => ac.close(), 600)
  } catch {}
}

// ─── Haptics ──────────────────────────────────────────────────────────────────
export const hapticPresentPop = () => { try { navigator.vibrate?.([8, 4, 18, 4, 35]) } catch {} }
export const hapticTap        = () => { try { navigator.vibrate?.(14) }                catch {} }
export const hapticBonus      = () => { try { navigator.vibrate?.([20, 10, 35]) }      catch {} }
export const hapticJackpot    = () => { try { navigator.vibrate?.([30, 12, 55, 12, 100]) } catch {} }
export const hapticCombo      = () => { try { navigator.vibrate?.([25, 8, 40, 8, 65]) }    catch {} }
export const hapticKonami     = () => { try { navigator.vibrate?.([20,8,30,8,50,8,80,8,120]) } catch {} }

// ─── Chip tap pop — feedback imediato ao tocar o chip (Candy Crush feel) ────
export function playChipTap(): void {
  try {
    const ac  = actx()
    const now = ac.currentTime
    const o   = ac.createOscillator()
    const g   = ac.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(780, now)
    o.frequency.exponentialRampToValueAtTime(380, now + 0.048)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.22, now + 0.006)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.052)
    o.connect(g); g.connect(ac.destination)
    o.start(now); o.stop(now + 0.06)
    setTimeout(() => ac.close(), 200)
  } catch {}
}

// ─── Menu hover blip (desktop only) ──────────────────────────────────────────
export function playMenuHover(): void {
  if (!window.matchMedia('(hover: hover)').matches) return
  try {
    const ac  = actx()
    const now = ac.currentTime
    const o   = ac.createOscillator()
    const g   = ac.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(880, now)
    o.frequency.exponentialRampToValueAtTime(1040, now + 0.04)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.14, now + 0.008)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.055)
    o.connect(g); g.connect(ac.destination)
    o.start(now); o.stop(now + 0.06)
    setTimeout(() => ac.close(), 200)
  } catch {}
}
