import React, { useEffect, useRef } from 'react'

/**
 * 热量仪表盘
 * 展示今日热量摄入情况
 */
function CalorieDashboard({ budget, intake }) {
  const canvasRef = useRef(null)

  const remaining = budget - intake
  const percentage = Math.min((intake / budget) * 100, 100)
  const isOver = intake > budget

  // 颜色逻辑
  const getColor = () => {
    if (percentage < 70) return { main: '#64c8ff', text: '合理' }
    if (percentage < 100) return { main: '#ffb347', text: '接近上限' }
    return { main: '#ff6b6b', text: '超标' }
  }

  const colors = getColor()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height * 0.55
    const radius = Math.min(width, height) * 0.38

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 背景弧
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.stroke()

    // 进度弧
    const progressAngle = Math.PI * 0.75 + (percentage / 100) * Math.PI * 1.5
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, progressAngle)

    const gradient = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius)
    gradient.addColorStop(0, colors.main)
    gradient.addColorStop(1, colors.main + '80')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.stroke()

    // 绘制刻度
    const ticks = [0, 25, 50, 75, 100]
    ticks.forEach(tick => {
      const tickAngle = Math.PI * 0.75 + (tick / 100) * Math.PI * 1.5
      const innerRadius = radius - 12
      const outerRadius = radius + 12

      const x1 = centerX + Math.cos(tickAngle) * innerRadius
      const y1 = centerY + Math.sin(tickAngle) * innerRadius
      const x2 = centerX + Math.cos(tickAngle) * outerRadius
      const y2 = centerY + Math.sin(tickAngle) * outerRadius

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      ctx.stroke()
    })

  }, [percentage, colors])

  return (
    <div className="calorie-dashboard">
      <canvas
        ref={canvasRef}
        className="dashboard-canvas"
      />

      <div className="dashboard-center">
        <div className="dashboard-intake" style={{ color: colors.main }}>
          {intake}
        </div>
        <div className="dashboard-unit">kcal</div>
        <div className="dashboard-status" style={{ color: colors.main }}>
          {colors.text}
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-item">
          <div className="stat-value">{budget}</div>
          <div className="stat-label">预算</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: isOver ? '#ff6b6b' : '#64c8ff' }}>
            {isOver ? '+' : '-'}{Math.abs(remaining)}
          </div>
          <div className="stat-label">{isOver ? '超出' : '剩余'}</div>
        </div>
      </div>
    </div>
  )
}

export default CalorieDashboard
