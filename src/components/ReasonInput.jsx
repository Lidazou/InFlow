import React, { useState, useRef, useEffect } from 'react'

/**
 * 原因输入面板 - 底部弹出式
 * 用户记录情绪后，引导输入原因
 */
function ReasonInput({ visible, emoji, label, score, onSave, onSkip }) {
  const [reason, setReason] = useState('')
  const inputRef = useRef(null)

  // 面板出现时聚焦输入框
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    } else {
      setReason('')
    }
  }, [visible])

  if (!visible) return null

  const handleSave = () => {
    onSave(reason)
    setReason('')
  }

  const handleSkip = () => {
    onSkip()
    setReason('')
  }

  return (
    <div className="reason-overlay" onClick={handleSkip}>
      <div className="reason-panel" onClick={e => e.stopPropagation()}>
        {/* 顶部情绪信息 */}
        <div className="reason-header">
          <div className="reason-emoji">{emoji}</div>
          <div className="reason-info">
            <div className="reason-label">{label}</div>
            <div className="reason-score">{score}分</div>
          </div>
        </div>

        {/* 提示文案 */}
        <div className="reason-prompt">
          是什么影响了您当下的心情？
        </div>

        {/* 输入框 */}
        <div className="reason-input-wrapper">
          <textarea
            ref={inputRef}
            className="reason-input"
            placeholder="和朋友聊天很开心..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <div className="reason-count">{reason.length}/200</div>
        </div>

        {/* 按钮 */}
        <div className="reason-actions">
          <button className="reason-btn skip" onClick={handleSkip}>
            跳过
          </button>
          <button className="reason-btn save" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReasonInput
