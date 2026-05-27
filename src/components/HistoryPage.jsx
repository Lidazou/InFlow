import React, { useState, useEffect } from 'react'
import { getAllRecords } from '../data/localStorage'
import EmotionChart from './EmotionChart'
import AnalysisEngine from './AnalysisEngine'

/**
 * 历史页面
 * 展示所有情绪记录、折线图、自动分析
 */
function HistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // 加载记录
  const loadRecords = () => {
    const data = getAllRecords()
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => {
    loadRecords()
    // 监听 storage 变化（从其他页面返回时刷新）
    window.addEventListener('storage', loadRecords)
    return () => window.removeEventListener('storage', loadRecords)
  }, [])

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const mins = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hours}:${mins}`
  }

  // 空状态
  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">加载中...</div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="history-page">
        <div className="history-empty">
          <div className="empty-icon">📝</div>
          <div className="empty-text">还没有记录</div>
          <div className="empty-hint">开始记录你的第一条心情吧</div>
        </div>
      </div>
    )
  }

  return (
    <div className="history-page">
      {/* 页面标题 */}
      <div className="history-header">
        <h2 className="history-title">情绪记录</h2>
        <div className="history-count">共 {records.length} 条</div>
      </div>

      {/* 折线图分析 */}
      <div className="history-section">
        <EmotionChart records={records.slice(0, 14)} />
      </div>

      {/* 自动分析建议 */}
      <div className="history-section">
        <AnalysisEngine records={records.slice(0, 7)} />
      </div>

      {/* 记录列表 */}
      <div className="history-section">
        <h3 className="section-title">最近记录</h3>
        <div className="record-list">
          {records.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-left">
                <div className="record-emoji">{record.emoji}</div>
                <div className="record-info">
                  <div className="record-label">{record.label}</div>
                  <div className="record-time">{formatTime(record.timestamp)}</div>
                </div>
              </div>
              <div className="record-right">
                <div className="record-score">{record.score}</div>
              </div>
              {record.reason && (
                <div className="record-reason">
                  <span className="reason-icon">💬</span>
                  {record.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
