import React, { useMemo } from 'react'

/**
 * 自动分析引擎
 * 基于规则生成情绪分析建议
 */

// 分析规则配置
const RULES = {
  // 平均分很低
  LOW_AVG: {
    threshold: 30,
    message: '近期情绪得分偏低，可能正在经历一段艰难的时期。',
    suggestions: [
      '记得给自己一些喘息的空间',
      '适当的休息和放松对情绪很重要',
      '如果感觉持续低迷，考虑和信任的人聊聊',
    ],
  },
  // 平均分中等
  MEDIUM_AVG: {
    threshold: { min: 30, max: 60 },
    message: '近期情绪状态相对平稳，处于不悲不喜的状态。',
    suggestions: [
      '可以尝试一些小变化来为生活增添乐趣',
      '记录让你感到愉悦的小事',
    ],
  },
  // 平均分较高
  HIGH_AVG: {
    threshold: 60,
    message: '近期情绪状态积极，整体表现不错。',
    suggestions: [
      '继续保持当前的生活节奏',
      '可以尝试新的挑战或目标',
    ],
  },
  // 波动很大
  HIGH_VARIANCE: {
    threshold: 40,
    message: '近期情绪波动较大，起伏明显。',
    suggestions: [
      '建议关注波动的触发因素',
      '尝试记录情绪变化的时间点',
      '保持规律作息可能有助于稳定情绪',
    ],
  },
  // 连续低分
  CONSECUTIVE_LOW: {
    count: 3,
    threshold: 30,
    message: '连续多次记录显示情绪偏低，需要关注。',
    suggestions: [
      '建议适当放慢节奏',
      '考虑做一些让自己放松的活动',
      '与朋友或家人交流可能有助于缓解',
    ],
  },
  // 连续高分
  CONSECUTIVE_HIGH: {
    count: 3,
    threshold: 60,
    message: '连续多次记录显示情绪积极，状态很好。',
    suggestions: [
      '当前状态不错，可以趁此机会完成一些目标',
      '但也要注意不要过度消耗自己',
    ],
  },
}

/**
 * 计算分析结果
 */
function analyzeRecords(records) {
  if (!records || records.length === 0) {
    return null
  }

  const scores = records.map(r => r.score)
  const count = scores.length

  // 基本统计
  const avg = scores.reduce((a, b) => a + b, 0) / count
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  const variance = max - min

  // 构建分析结果
  const insights = []

  // 1. 分析平均分
  if (avg < RULES.LOW_AVG.threshold) {
    insights.push({
      type: 'warning',
      title: '整体偏低',
      message: RULES.LOW_AVG.message,
      suggestions: RULES.LOW_AVG.suggestions,
    })
  } else if (avg >= RULES.HIGH_AVG.threshold) {
    insights.push({
      type: 'positive',
      title: '状态良好',
      message: RULES.HIGH_AVG.message,
      suggestions: RULES.HIGH_AVG.suggestions,
    })
  } else {
    insights.push({
      type: 'neutral',
      title: '平稳过渡',
      message: RULES.MEDIUM_AVG.message,
      suggestions: RULES.MEDIUM_AVG.suggestions,
    })
  }

  // 2. 分析波动幅度
  if (variance >= RULES.HIGH_VARIANCE.threshold) {
    insights.push({
      type: 'warning',
      title: '波动较大',
      message: RULES.HIGH_VARIANCE.message,
      suggestions: RULES.HIGH_VARIANCE.suggestions,
    })
  }

  // 3. 分析连续低分
  let consecutiveLow = 0
  let consecutiveHigh = 0
  for (const score of scores) {
    if (score < RULES.CONSECUTIVE_LOW.threshold) {
      consecutiveLow++
      consecutiveHigh = 0
    } else if (score >= RULES.CONSECUTIVE_HIGH.threshold) {
      consecutiveHigh++
      consecutiveLow = 0
    } else {
      consecutiveLow = 0
      consecutiveHigh = 0
    }
  }

  if (consecutiveLow >= RULES.CONSECUTIVE_LOW.count) {
    insights.push({
      type: 'warning',
      title: '持续低迷',
      message: RULES.CONSECUTIVE_LOW.message,
      suggestions: RULES.CONSECUTIVE_LOW.suggestions,
    })
  } else if (consecutiveHigh >= RULES.CONSECUTIVE_HIGH.count) {
    insights.push({
      type: 'positive',
      title: '持续向好',
      message: RULES.CONSECUTIVE_HIGH.message,
      suggestions: RULES.CONSECUTIVE_HIGH.suggestions,
    })
  }

  // 4. 综合建议
  const summary = `最近 ${count} 条记录，平均得分 ${avg.toFixed(1)}，最高 ${max}，最低 ${min}。`

  return {
    count,
    avg: avg.toFixed(1),
    max,
    min,
    variance,
    summary,
    insights,
  }
}

/**
 * 分析引擎组件
 */
function AnalysisEngine({ records }) {
  const analysis = useMemo(() => analyzeRecords(records), [records])

  if (!analysis || records.length < 3) {
    return (
      <div className="analysis-container">
        <div className="analysis-title">智能分析</div>
        <div className="analysis-empty">
          至少需要 3 条记录才能生成分析
        </div>
      </div>
    )
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'positive': return '✨'
      case 'warning': return '💡'
      default: return '📊'
    }
  }

  const getTypeClass = (type) => {
    return `analysis-card ${type}`
  }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <div className="analysis-title">智能分析</div>
        <div className="analysis-summary">{analysis.summary}</div>
      </div>

      <div className="analysis-list">
        {analysis.insights.map((insight, i) => (
          <div key={i} className={getTypeClass(insight.type)}>
            <div className="card-header">
              <span className="card-icon">{getTypeIcon(insight.type)}</span>
              <span className="card-title">{insight.title}</span>
            </div>
            <div className="card-message">{insight.message}</div>
            <div className="card-suggestions">
              {insight.suggestions.map((s, j) => (
                <div key={j} className="suggestion-item">
                  • {s}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalysisEngine
