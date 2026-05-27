import React, { useEffect, useRef } from 'react'

/**
 * 情绪折线图 - Canvas 实现
 * 展示近期情绪得分变化趋势
 */
function EmotionChart({ records }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || records.length < 2) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // 设置画布尺寸
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 30, left: 35 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 获取数据
    const data = records.map(r => r.score).reverse()
    const minScore = 0
    const maxScore = 100

    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1

    // 水平网格线（0, 25, 50, 75, 100）
    ;[0, 25, 50, 75, 100].forEach(val => {
      const y = padding.top + chartHeight - (val / maxScore) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Y 轴标签
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(val.toString(), padding.left - 8, y)
    })

    // 计算点位置
    const points = data.map((val, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((val - minScore) / (maxScore - minScore)) * chartHeight,
      score: val
    }))

    // 绘制渐变填充
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, 'rgba(100, 180, 255, 0.3)')
    gradient.addColorStop(1, 'rgba(100, 180, 255, 0)')

    ctx.beginPath()
    ctx.moveTo(points[0].x, height - padding.bottom)
    points.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // 绘制折线
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) * 0.5
      const cp1y = points[i - 1].y
      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) * 0.5
      const cp2y = points[i].y
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y)
    }

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()

    // 绘制点
    points.forEach((p, i) => {
      // 外圈
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)'
      ctx.fill()

      // 内圈
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#64c8ff'
      ctx.fill()
    })

    // X 轴标签（时间）
    const labelRecords = records.slice().reverse()
    labelRecords.forEach((record, i) => {
      const x = points[i].x
      const date = new Date(record.timestamp)
      const label = `${date.getMonth() + 1}/${date.getDate()}`

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.font = '9px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(label, x, height - padding.bottom + 8)
    })

  }, [records])

  // 数据不够
  if (!records || records.length < 2) {
    return (
      <div className="chart-container">
        <div className="chart-title">情绪趋势</div>
        <div className="chart-empty">
          至少需要 2 条记录才能生成图表
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="chart-title">情绪趋势</div>
      <div className="chart-subtitle">最近 {records.length} 条记录</div>
      <canvas
        ref={canvasRef}
        className="chart-canvas"
      />
    </div>
  )
}

export default EmotionChart
