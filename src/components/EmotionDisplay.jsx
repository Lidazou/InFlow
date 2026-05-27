import React from 'react'

/**
 * 顶部情绪显示组件
 * 显示当前情绪名称和分数
 */
function EmotionDisplay({ label, score, isActive }) {
  return (
    <div className="emotion-display">
      <h1 className={`emotion-label ${isActive ? 'active' : ''}`}>
        {label}
      </h1>
      <p className={`emotion-score ${isActive ? 'active' : ''}`}>
        {Math.round(score)}
        <span className="score-suffix">分</span>
      </p>
    </div>
  )
}

export default EmotionDisplay
