import React, { useRef, useEffect, useCallback } from 'react'

/**
 * 粒子画布组件
 * 从底部按钮向上发射粒子，流向 Emoji
 */
function ParticleCanvas({ isActive, intensity }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)

  // 粒子类
  class Particle {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.size = Math.random() * 3 + 1
      this.speedY = -(Math.random() * 3 + 2) * intensity
      this.speedX = (Math.random() - 0.5) * 2
      this.opacity = Math.random() * 0.5 + 0.3
      this.life = 1
      this.decay = Math.random() * 0.02 + 0.01
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY
      this.life -= this.decay
      this.opacity = this.life * 0.5
    }

    draw(ctx) {
      ctx.save()
      ctx.globalAlpha = this.opacity
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 根据活跃状态和强度生成粒子
    if (isActive && Math.random() < 0.3 * intensity) {
      // 从屏幕底部中央发射
      const x = canvas.width / 2 + (Math.random() - 0.5) * 100
      const y = canvas.height - 100
      particlesRef.current.push(new Particle(x, y))
    }

    // 更新和绘制粒子
    particlesRef.current = particlesRef.current.filter(p => p.life > 0)
    particlesRef.current.forEach(p => {
      p.update()
      p.draw(ctx)
    })

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [isActive, intensity])

  // 设置画布尺寸
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // 启动/停止动画
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animate])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

export default ParticleCanvas
