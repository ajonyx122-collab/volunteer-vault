// A short, cheerful "achievement unlocked" chime, synthesized with the Web
// Audio API so there's no audio file to ship. Called from user gestures (log
// hours, RSVP), which satisfies browser autoplay rules. Fails silently if
// audio isn't available.
export function playAchievement() {
  if (typeof window === 'undefined') return
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    // A little rising C-major arpeggio: C5 E5 G5 C6.
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = now + i * 0.085
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.32)
    })
    setTimeout(() => ctx.close?.(), 900)
  } catch {
    /* no-op: audio blocked or unsupported */
  }
}
