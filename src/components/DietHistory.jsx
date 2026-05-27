import React, { useEffect, useRef } from 'react'
import { getRecentDietRecords, calculateDayTotal } from '../data/dietStorage'

/**
 * 饮食历史折线图
 * 展示近 7 天热量摄入趋势
 */
function DietHistory({ budget }) {
  const canvasRef = useRef(null)

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
    const padding = { top: 20, right: 20, bottom: 40, left: 45 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // 获取近 7 天数据
    const records = getRecentDietRecords(7)

    // 生成完整的 7 天数据（含空天）
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const record = records.find(r => r.date === dateStr)
      days.push({
        date: dateStr,
        intake: record ? calculateDayTotal(record) : 0,
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      })
    }

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 绘制预算线
    if (budget > 0) {
      const budgetY = padding.top + chartHeight - (budget / (budget * 1.5)) * chartHeight

      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(padding.left, budgetY)
      ctx.lineTo(width - padding.right, budgetY)
      ctx.strokeStyle = 'rgba(255, 180, 71, 0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.setLineDash([])

      // 预算标签
      ctx.fillStyle = 'rgba(255, 180, 71, 0.7)'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(`预算 ${budget}`, padding.left + 5, budgetY - 5)
    }

    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 1

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // 计算数据点
    const maxValue = Math.max(...days.map(d => d.intake), budget || 0)
    const scale = maxValue > 0 ? chartHeight / maxValue : 1

    const points = days.map((d, i) => ({
      x: padding.left + (i / 6) * chartWidth,
      y: padding.top + chartHeight - d.intake * scale,
      intake: d.intake,
    }))

    // 绘制面积填充
    ctx.beginPath()
    ctx.moveTo(points[0].x, height - padding.bottom)
    points.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.25)')
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fill()

    // 绘制折线
    ctx.beginPath()
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    // 绘制数据点
    points.forEach((p, i) => {
      // 外圈
      ctx.beginPath()
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)'
      ctx.fill()

      // 内圈
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#64c8ff'
      ctx.fill()

      // 热量标签
      if (p.intake > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.font = '10px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(p.intake, p.x, p.y - 12)
      }
    })

    // X 轴标签
    days.forEach((d, i) => {
      const x = padding.left + (i / 6) * chartWidth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(d.displayDate, x, height - padding.bottom + 18)
    })

  }, [budget])

  return (
    <div className="diet-history">
      <div className="history-header">
        <span className="history-title">近 7 天热量</span>
      </div>
      <canvas ref={canvasRef} className="history-canvas" />
    </div>
  )
}

export default DietHistory
