// Dependency-free confetti that fills the whole screen: a heavy shower raining
// down from across the top plus two "cannons" firing up from the bottom
// corners. Draws a one-off full-screen canvas, animates with gravity, fades
// out, then removes itself. This fires only from an explicit celebration the
// person triggered (logging hours, RSVP, a milestone), so it intentionally
// shows even when "reduce motion" is on — it's a brief reward, not ambient
// motion. No-op on the server.
export function fireConfetti({ count = 320 } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const colors = ['#E8983E', '#D85A30', '#1B5E38', '#F5C542', '#7FB77E', '#FFF7E8', '#94305C']
  const duration = 4200
  const parts = []

  const make = (x, y, vx, vy) => ({
    x,
    y,
    vx,
    vy,
    size: 5 + Math.random() * 8,
    color: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.4,
    round: Math.random() < 0.5,
    sway: Math.random() * Math.PI * 2,
  })

  // Heavy shower across the full width, starting above the top edge so it
  // rains down over the whole screen.
  const rain = Math.round(count * 0.72)
  for (let i = 0; i < rain; i++) {
    parts.push(
      make(
        Math.random() * W,
        // Spread from well above the top to ~35% down the screen, so a burst is
        // visible the instant it fires and then rains down the whole screen.
        Math.random() * (H * 1.45) - H * 1.1,
        (Math.random() - 0.5) * 2.5,
        2 + Math.random() * 4,
      ),
    )
  }
  // Two bottom-corner cannons firing up and inward to fill the sides.
  const cannon = Math.round(count * 0.14)
  const fire = (originX, dir) => {
    for (let i = 0; i < cannon; i++) {
      const angle = -Math.PI / 2 + dir * (0.15 + Math.random() * 0.5)
      const speed = 9 + Math.random() * 9
      parts.push(make(originX, H + 10, Math.cos(angle) * speed, Math.sin(angle) * speed))
    }
  }
  fire(0, 1)
  fire(W, -1)

  const start = performance.now()
  function frame(now) {
    const t = now - start
    ctx.clearRect(0, 0, W, H)
    for (const p of parts) {
      p.vy += 0.14 // gravity
      p.vx *= 0.995
      p.sway += 0.05
      p.x += p.vx + Math.sin(p.sway) * 0.6 // gentle side-to-side flutter
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = t < duration - 700 ? 1 : Math.max(0, (duration - t) / 700)
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
