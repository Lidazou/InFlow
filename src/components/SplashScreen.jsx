import React, { useEffect, useRef, useCallback, useState } from 'react'

/**
 * InFlow 开屏动画
 * 粒子汇聚 → 实体文字 → 直接切换 Slogan → 实体文字 → 消散
 */
const CONFIG = {
  PARTICLE_COUNT: 600,
  PARTICLE_SIZE: 1.8,
  LOGO_RATIO: 0.22,
  TAGLINE_RATIO: 0.11,
  BG_COLOR: '#0B0F1A',
}

class Particle {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.size = CONFIG.PARTICLE_SIZE
    this.alpha = 0
    this.phase = Math.random() * Math.PI * 2
    this.targetX = 0
    this.targetY = 0
    this.vx = 0
    this.vy = 0
    this.reset()
  }

  reset() {
    const m = 150
    const s = Math.floor(Math.random() * 4)
    if (s === 0) { this.x = Math.random() * this.w; this.y = -m }
    else if (s === 1) { this.x = this.w + m; this.y = Math.random() * this.h }
    else if (s === 2) { this.x = Math.random() * this.w; this.y = this.h + m }
    else { this.x = -m; this.y = Math.random() * this.h }
    this.originX = this.x
    this.originY = this.y
    this.targetX = this.x
    this.targetY = this.y
    this.vx = 0
    this.vy = 0
    this.alpha = 0
  }

  setTarget(x, y) { this.targetX = x; this.targetY = y }

  moveTo(speed = 0.012, friction = 0.92) {
    this.vx += (this.targetX - this.x) * speed
    this.vy += (this.targetY - this.y) * speed
    this.vx *= friction
    this.vy *= friction
    this.x += this.vx
    this.y += this.vy
  }

  fluctuate(t) {
    this.x += Math.sin(t * 0.0006 + this.phase) * 0.4
    this.y += Math.cos(t * 0.0008 + this.phase) * 0.35
  }

  fadeIn(s = 0.02) { this.alpha = Math.min(1, this.alpha + s) }
  fadeOut(s = 0.02) { this.alpha = Math.max(0, this.alpha - s) }

  dissolve(s = 1) {
    this.vx += (Math.random() - 0.5) * 5 * s
    this.vy += (Math.random() - 0.5) * 5 * s - 0.5 * s
    this.alpha *= 0.97
    this.vx *= 0.96
    this.vy *= 0.96
    this.x += this.vx
    this.y += this.vy
  }

  rise(s = 1) {
    this.vy -= 0.6 * s
    this.vx += (Math.random() - 0.5) * 0.5
    this.alpha *= 0.97
    this.x += this.vx
    this.y += this.vy
  }
}

function sampleText(text, w, h, size, align = 'center', lh = 1.3) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const c = off.getContext('2d')
  c.fillStyle = '#fff'
  c.font = `700 ${size}px system-ui,-apple-system,sans-serif`
  c.textBaseline = 'middle'
  const pts = []
  const step = 4

  const lines = text.split('\n')
  const totalH = lines.length * size * lh
  const startY = h / 2 - totalH / 2 + size / 2

  if (align === 'left') {
    c.textAlign = 'left'
    const sx = w * 0.1
    lines.forEach((ln, i) => c.fillText(ln, sx, startY + i * size * lh))
    const d = c.getImageData(0, 0, w, h).data
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w * 0.72; px += step) {
        if (d[(py * w + px) * 4 + 3] > 70) pts.push({ x: px, y: py })
      }
    }
  } else {
    c.textAlign = 'center'
    lines.forEach((ln, i) => c.fillText(ln, w / 2, startY + i * size * lh))
    const d = c.getImageData(0, 0, w, h).data
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        if (d[(py * w + px) * 4 + 3] > 70) pts.push({ x: px, y: py })
      }
    }
  }

  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pts[i], pts[j]] = [pts[j], pts[i]]
  }
  return pts
}

function drawText(ctx, text, w, h, size, align = 'center', lh = 1.3, alpha = 1) {
  ctx.save()
  ctx.font = `700 ${size}px system-ui,-apple-system,sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = `rgba(255,255,255,${alpha})`
  ctx.shadowColor = `rgba(255,255,255,${alpha * 0.35})`
  ctx.shadowBlur = 60

  const lines = text.split('\n')
  const totalH = lines.length * size * lh
  const startY = h / 2 - totalH / 2 + size / 2

  if (align === 'left') {
    ctx.textAlign = 'left'
    const sx = w * 0.1
    lines.forEach((ln, i) => ctx.fillText(ln, sx, startY + i * size * lh))
  } else {
    ctx.textAlign = 'center'
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, startY + i * size * lh))
  }
  ctx.restore()
}

function SplashScreen({ onComplete }) {
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const phaseRef = useRef(0)
  const startRef = useRef(0)
  const [phase2Triggered, setPhase2Triggered] = useState(false)

  const goNext = useCallback(() => {
    setVisible(false)
    setTimeout(() => onComplete?.(), 700)
  }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = null
    let particles = []
    let fs = 0
    let tfs = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      fs = Math.min(canvas.width, canvas.height) * CONFIG.LOGO_RATIO
      tfs = Math.min(canvas.width, canvas.height) * CONFIG.TAGLINE_RATIO
    }
    resize()
    window.addEventListener('resize', resize)

    const initP = () => {
      particles = []
      for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) particles.push(new Particle(canvas.width, canvas.height))
    }

    const setPts = (p) => {
      particles.forEach((p2, i) => {
        if (i < p.length) p2.setTarget(p[i].x, p[i].y)
        else {
          const r = p[Math.floor(Math.random() * p.length)]
          p2.setTarget(r.x + (Math.random() - 0.5) * 250, r.y + (Math.random() - 0.5) * 120)
        }
      })
    }

    const start = Date.now()
    startRef.current = start
    initP()
    setPts(sampleText('InFlow', canvas.width, canvas.height, fs))

    const tick = (t) => {
      const w = canvas.width
      const h = canvas.height
      const elapsed = Date.now() - startRef.current

      ctx.clearRect(0, 0, w, h)

      // 时序
      const T1 = 4500  // Phase 0: InFlow 粒子汇聚 + 文字渐显
      const T2 = T1 + 1200  // Phase 1: InFlow 稳定展示
      const T3 = T2 + 1000  // Phase 2: 直接切换 Slogan（无粒子过渡）
      const T4 = T3 + 800  // Phase 3: Slogan 稳定展示
      const T5 = T4 + 1600 // Phase 4: 消散

      // ----- Phase 0: 粒子聚合成 InFlow -----
      if (elapsed < T1) {
        const p = Math.min(1, elapsed / T1)
        // easeOutQuart 缓动
        const e = 1 - Math.pow(1 - p, 4)

        particles.forEach(p2 => {
          p2.moveTo(0.012 * e, 0.92)
          p2.fadeIn(0.012)
          p2.fluctuate(t)

          const fx = p2.x + Math.sin(t * 0.0006 + p2.phase) * 0.35
          const fy = p2.y + Math.cos(t * 0.0008 + p2.phase) * 0.3

          ctx.beginPath()
          ctx.arc(fx, fy, p2.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${p2.alpha * 0.92})`
          ctx.fill()
        })

        // 文字在粒子汇聚到 80% 后突然出现（不渐显）
        if (p > 0.8) {
          const textAlpha = Math.min(1, (p - 0.8) / 0.2) * 0.9
          drawText(ctx, 'InFlow', w, h, fs, 'center', 1.3, textAlpha)
        }

        if (p >= 1) { phaseRef.current = 1; startRef.current = Date.now() }
      }
      // ----- Phase 1: InFlow 呼吸 + 粒子微动 -----
      else if (elapsed < T2) {
        const p = Math.min(1, (elapsed - T1) / (T2 - T1))

        particles.forEach(p2 => {
          p2.fluctuate(t)
          ctx.beginPath()
          ctx.arc(p2.x, p2.y, p2.size, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,255,255,0.93)'
          ctx.fill()
        })
        // 文字保持 95% 透明度
        drawText(ctx, 'InFlow', w, h, fs, 'center', 1.3, 0.95)

        if (p >= 1) {
          phaseRef.current = 2
          startRef.current = Date.now()
          // 触发 Slogan 文字渐显（不重置粒子，直接复用）
          setPhase2Triggered(true)
        }
      }
      // ----- Phase 2: 直接切换 Slogan（无粒子动画）-----
      else if (elapsed < T3) {
        const p = Math.min(1, (elapsed - T2) / (T3 - T2))
        const e = 1 - Math.pow(1 - p, 3) // easeOutQuart

        // Logo 文字渐隐
        drawText(ctx, 'InFlow', w, h, fs, 'center', 1.3, 0.95 * (1 - e))

        // Slogan 文字渐显（从透明到可见）
        drawText(ctx, 'Track your every\nInFlow moment', w, h, tfs, 'left', 1.55, e * 0.88)

        // 粒子原地呼吸，不做扩散
        particles.forEach(p2 => {
          p2.fluctuate(t)
          p2.fadeIn(0.01)
          ctx.beginPath()
          ctx.arc(p2.x, p2.y, p2.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220,235,255,${p2.alpha * (1 - e * 0.5)})`
          ctx.fill()
        })

        if (p >= 1) {
          phaseRef.current = 3
          startRef.current = Date.now()
        }
      }
      // ----- Phase 3: Slogan 稳定展示 -----
      else if (elapsed < T4) {
        const p = Math.min(1, (elapsed - T3) / (T4 - T3))

        particles.forEach(p2 => {
          p2.fluctuate(t)
          ctx.beginPath()
          ctx.arc(p2.x, p2.y, p2.size, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(220,235,255,0.9)'
          ctx.fill()
        })
        drawText(ctx, 'Track your every\nInFlow moment', w, h, tfs, 'left', 1.55, 0.88)

        if (p >= 1) {
          phaseRef.current = 4
          startRef.current = Date.now()
        }
      }
      // ----- Phase 4: 消散 -----
      else if (elapsed < T5) {
        const p = Math.min(1, (elapsed - T4) / (T5 - T4))
        const e = 1 - Math.pow(1 - p, 2.5)

        particles.forEach(p2 => {
          p2.rise(e)
          ctx.beginPath()
          ctx.arc(p2.x, p2.y, p2.size * p2.alpha, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220,235,255,${p2.alpha * (1 - e)})`
          ctx.fill()
        })
        drawText(ctx, 'Track your every\nInFlow moment', w, h, tfs, 'left', 1.55, 0.88 * (1 - e))

        if (p >= 1) { raf = null; goNext(); return }
      }
      else {
        raf = null; goNext(); return
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [goNext])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: CONFIG.BG_COLOR,
      zIndex: 9999,
      opacity: visible ? 1 : 0,
      transition: 'opacity 700ms ease-out',
      pointerEvents: visible ? 'all' : 'none',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  )
}

export default SplashScreen
