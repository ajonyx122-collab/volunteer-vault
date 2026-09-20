// Tiny dependency-free confetti burst. Draws a one-off canvas over the page,
// animates a spray of colourful bits with gravity, fades them out, then
// removes itself. Honors reduced-motion (does nothing). Safe to call anywhere
// client-side; a no-op on the server.
export function fireConfetti({ count = 130, originY = 0.4 } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const W = window.innerWidth
  const H = window.innerHeight
  const colors = ['#E8983E', '#D85A30', '#1B5E38', '#F5C542', '#7FB77E', '#FFF7E8']
  const cx = W / 2
  const cy = H * originY
  const duration = 2400

  const parts = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 8
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      size: 5 + Math.random() * 7,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      round: Math.random() < 0.5,
    }
  })

  const start = performance.now()
  function frame(now) {
    const t = now - start
    ctx.clearRect(0, 0, W, H)
    for (const p of parts) {
      p.vy += 0.16 // gravity
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.max(0, 1 - t / duration)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      }
      ctx.restore()
    }
    if (t < duration) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
