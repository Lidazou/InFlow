import React, { useMemo } from 'react'
import { getRecentDietRecords, calculateDayTotal } from '../data/dietStorage'

/**
 * 饮食自动分析引擎
 */
function DietAnalysis({ budget }) {
  const analysis = useMemo(() => {
    const records = getRecentDietRecords(7)
    if (records.length < 2) return null

    const intakes = records.map(r => calculateDayTotal(r))
    const avgIntake = intakes.reduce((a, b) => a + b, 0) / intakes.length
    const maxIntake = Math.max(...intakes)
    const minIntake = Math.min(...intakes)
    const variance = maxIntake - minIntake

    // 与预算比较
    const overBudgetDays = intakes.filter(i => i > budget).length
    const underBudgetDays = intakes.filter(i => i < budget * 0.7).length
    const avgPercentage = (avgIntake / budget) * 100

    const insights = []

    // 整体趋势分析
    if (avgPercentage < 70) {
      insights.push({
        type: 'warning',
        title: '摄入偏少',
        message: `近 ${records.length} 天平均摄入 ${avgIntake.toFixed(0)} kcal，低于预算 70%。长期热量摄入不足可能影响身体健康。`,
      })
    } else if (avgPercentage > 110) {
      insights.push({
        type: 'warning',
        title: '摄入偏高',
        message: `近 ${records.length} 天平均摄入 ${avgIntake.toFixed(0)} kcal，持续超过预算。可能需要留意高热量食物。`,
      })
    } else if (avgPercentage >= 85 && avgPercentage <= 105) {
      insights.push({
        type: 'positive',
        title: '摄入合理',
        message: `近 ${records.length} 天平均摄入 ${avgIntake.toFixed(0)} kcal，与预算基本持平，摄入控制良好。`,
      })
    }

    // 波动分析
    if (variance > budget * 0.5) {
      insights.push({
        type: 'warning',
        title: '波动较大',
        message: `最高日 ${maxIntake} kcal，最低日 ${minIntake} kcal，相差 ${variance.toFixed(0)} kcal，建议保持更稳定的饮食习惯。`,
      })
    }

    // 超标分析
    if (overBudgetDays > records.length * 0.5) {
      insights.push({
        type: 'warning',
        title: '频繁超标',
        message: `近 ${records.length} 天中有 ${overBudgetDays} 天超过预算，建议减少高热量食物摄入。`,
      })
    }

    // 不足分析
    if (underBudgetDays > records.length * 0.5 && avgPercentage < 80) {
      insights.push({
        type: 'info',
        title: '摄入不足',
        message: `近 ${records.length} 天中有 ${underBudgetDays} 天摄入不足目标的 70%，需注意营养均衡。`,
      })
    }

    // 如果没有任何问题
    if (insights.length === 0) {
      insights.push({
        type: 'neutral',
        title: '数据正常',
        message: `近 ${records.length} 天饮食记录整体正常，继续保持当前的饮食习惯。`,
      })
    }

    return {
      avgIntake: avgIntake.toFixed(0),
      maxIntake,
      minIntake,
      variance,
      budget,
      overBudgetDays,
      insights,
    }
  }, [budget])

  if (!analysis) {
    return (
      <div className="diet-analysis">
        <div className="analysis-title">智能分析</div>
        <div className="analysis-empty">至少需要 2 天数据才能生成分析</div>
      </div>
    )
  }

  return (
    <div className="diet-analysis">
      <div className="analysis-header">
        <div className="analysis-title">智能分析</div>
        <div className="analysis-summary">
          近 {analysis.overBudgetDays} 天平均 {analysis.avgIntake} kcal
        </div>
      </div>

      <div className="analysis-cards">
        {analysis.insights.map((insight, i) => (
          <div key={i} className={`analysis-card ${insight.type}`}>
            <div className="card-icon">
              {insight.type === 'positive' ? '✨' : insight.type === 'warning' ? '💡' : '📊'}
            </div>
            <div className="card-content">
              <div className="card-title">{insight.title}</div>
              <div className="card-message">{insight.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DietAnalysis
