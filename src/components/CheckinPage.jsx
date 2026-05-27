import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  saveCheckinConfig,
  getCheckinConfig,
  getTodayRecord,
  saveCheckinRecord,
  getRecordByDate,
  isRestDay,
  getStreak,
  getWeekProgress,
  hasReminderSent,
  setReminderSent,
} from '../data/checkinStorage'
import { sendTestEmail, sendReminderEmail } from '../services/emailService'

/**
 * 每日打卡模块
 */
function CheckinPage() {
  const [config, setConfig] = useState(null)
  const [showSetup, setShowSetup] = useState(false)
  const [todayRecord, setTodayRecord] = useState(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [studiedMinutes, setStudiedMinutes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weekProgress, setWeekProgress] = useState([])
  const [showSetupForm, setShowSetupForm] = useState(false)

  // 计时器 refs
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const accumulatedRef = useRef(0)

  // 初始化
  useEffect(() => {
    const cfg = getCheckinConfig()
    setConfig(cfg)

    if (!cfg) {
      setShowSetupForm(true)
    } else {
      loadTodayRecord()
      setStreak(getStreak())
      setWeekProgress(getWeekProgress())

      // 检查是否需要发送提醒
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const yesterdayRecord = getRecordByDate(yesterdayStr)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][yesterday.getDay()]
      const wasRestDay = cfg.restDays.includes(dayOfWeek)

      if (!wasRestDay && (!yesterdayRecord || !yesterdayRecord.completed) && !hasReminderSent(yesterdayStr)) {
        sendReminderEmail(cfg.email, yesterdayStr, cfg.moduleName, cfg.dailyGoalMinutes, cfg.name)
        setReminderSent(yesterdayStr)
      }
    }
  }, [])

  // 加载今日记录
  const loadTodayRecord = useCallback(() => {
    const record = getTodayRecord()
    setTodayRecord(record)
    if (record) {
      setStudiedMinutes(record.studiedMinutes || 0)
      if (record.completed) {
        setIsTimerRunning(false)
      }
    }
  }, [])

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 判断今日状态
  const getTodayStatus = () => {
    if (!config) return { isRest: false, isCompleted: false, needStudy: false }

    const rest = isRestDay(config)
    const completed = todayRecord?.completed || false
    const needStudy = !rest && !completed

    return { isRest: rest, isCompleted: completed, needStudy }
  }

  const todayStatus = getTodayStatus()

  // 进度百分比
  const progressPercent = config
    ? Math.min(100, (studiedMinutes / config.dailyGoalMinutes) * 100)
    : 0

  // 开始计时
  const handleStartTimer = () => {
    if (todayStatus.isRest || todayStatus.isCompleted) return

    setIsTimerRunning(true)
    startTimeRef.current = Date.now()
    accumulatedRef.current = studiedMinutes * 60 * 1000 // 转换为毫秒

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const totalMs = accumulatedRef.current + elapsed
      const minutes = Math.floor(totalMs / 60000)
      setStudiedMinutes(minutes)
    }, 1000)
  }

  // 暂停计时
  const handlePauseTimer = () => {
    if (!isTimerRunning) return

    setIsTimerRunning(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // 保存当前学习时长
    const elapsed = Date.now() - startTimeRef.current
    accumulatedRef.current += elapsed

    saveCurrentProgress()
  }

  // 保存当前进度
  const saveCurrentProgress = () => {
    const today = new Date().toISOString().split('T')[0]
    const completed = studiedMinutes >= (config?.dailyGoalMinutes || 0)

    const record = {
      date: today,
      studiedMinutes,
      completed,
      isRestDay: todayStatus.isRest,
      moduleName: config?.moduleName || '',
      websiteUrl: config?.websiteUrl || '',
      completedAt: completed ? Date.now() : null,
    }

    saveCheckinRecord(record)
    setTodayRecord(record)

    if (completed) {
      setStreak(getStreak())
      setWeekProgress(getWeekProgress())
    }
  }

  // 停止计时并重置
  const handleResetTimer = () => {
    handlePauseTimer()
    accumulatedRef.current = 0
    setStudiedMinutes(0)
    setIsTimerRunning(false)

    // 清除记录
    const today = new Date().toISOString().split('T')[0]
    const record = {
      date: today,
      studiedMinutes: 0,
      completed: false,
      isRestDay: todayStatus.isRest,
      moduleName: config?.moduleName || '',
      websiteUrl: config?.websiteUrl || '',
      completedAt: null,
    }
    saveCheckinRecord(record)
    setTodayRecord(record)
  }

  // 打开学习网站
  const handleOpenWebsite = () => {
    if (config?.websiteUrl) {
      window.open(config.websiteUrl, '_blank')
    }
  }

  // 测试邮件
  const handleTestEmail = async () => {
    if (!config?.email) return
    const result = await sendTestEmail(config.email)
    if (result.success) {
      alert('📧 测试邮件已发送！请检查你的邮箱。')
    } else {
      alert('❌ 邮件发送失败，请检查配置。')
    }
  }

  // 组件卸载时清理计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // ====== 初始化表单 ======
  if (showSetupForm || !config) {
    return (
      <CheckinSetup
        existingConfig={config}
        onComplete={(newConfig) => {
          setConfig(newConfig)
          setShowSetupForm(false)
          loadTodayRecord()
          setStreak(getStreak())
          setWeekProgress(getWeekProgress())
        }}
      />
    )
  }

  // ====== 主视图 ======
  return (
    <div className="checkin-page">
      <div className="checkin-header">
        <h2 className="checkin-title">每日打卡</h2>
        <button className="checkin-settings-btn" onClick={() => setShowSetup(true)}>
          ⚙️
        </button>
      </div>

      <div className="checkin-content scrollable">
        {/* 今日模块信息 */}
        <div className="checkin-module-card">
          <div className="module-name">{config.moduleName}</div>
          <div className="module-url" onClick={handleOpenWebsite}>
            🌐 {config.websiteUrl}
          </div>
        </div>

        {/* 今日状态 */}
        <div className="checkin-status-card">
          {todayStatus.isRest ? (
            <div className="status-rest">
              <div className="status-icon">😴</div>
              <div className="status-text">今天休息日</div>
              <div className="status-hint">好好放松，明天继续加油</div>
            </div>
          ) : todayStatus.isCompleted ? (
            <div className="status-completed">
              <div className="status-icon">✅</div>
              <div className="status-text">今日已完成打卡</div>
              <div className="status-hint">太棒了！继续保持</div>
            </div>
          ) : (
            <div className="status-pending">
              <div className="status-icon">📚</div>
              <div className="status-text">今日待打卡</div>
              <div className="status-hint">目标 {config.dailyGoalMinutes} 分钟</div>
            </div>
          )}
        </div>

        {/* 计时器区域 */}
        {!todayStatus.isRest && !todayStatus.isCompleted && (
          <div className="timer-card">
            <div className="timer-display">
              <div className="timer-time">{studiedMinutes}</div>
              <div className="timer-unit">分钟</div>
            </div>

            {/* 进度条 */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="progress-label">
              {studiedMinutes} / {config.dailyGoalMinutes} 分钟
            </div>

            {/* 计时器控制按钮 */}
            <div className="timer-controls">
              {!isTimerRunning ? (
                <button className="timer-btn start" onClick={handleStartTimer}>
                  ▶ 开始计时
                </button>
              ) : (
                <button className="timer-btn pause" onClick={handlePauseTimer}>
                  ⏸ 暂停
                </button>
              )}
              <button className="timer-btn reset" onClick={handleResetTimer}>
                ↺ 重置
              </button>
            </div>

            {/* 学习网站入口 */}
            <button className="website-btn" onClick={handleOpenWebsite}>
              🌐 进入学习网站
            </button>
          </div>
        )}

        {/* 连续打卡 */}
        <div className="streak-card">
          <div className="streak-value">{streak}</div>
          <div className="streak-label">连续打卡天数</div>
        </div>

        {/* 本周进度 */}
        <div className="week-progress-card">
          <div className="week-title">本周进度</div>
          <div className="week-days">
            {weekProgress.map((day) => (
              <div
                key={day.date}
                className={`week-day ${day.completed ? 'completed' : ''} ${day.isRestDay ? 'rest' : ''} ${day.isToday ? 'today' : ''}`}
              >
                <div className="day-name">{day.dayName}</div>
                <div className="day-status">
                  {day.isFuture ? '' : day.isRestDay ? '休' : day.completed ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSetup && (
        <CheckinSetup
          existingConfig={config}
          onComplete={(newConfig) => {
            setConfig(newConfig)
            setShowSetup(false)
          }}
          onClose={() => setShowSetup(false)}
        />
      )}
    </div>
  )
}

/**
 * 打卡设置表单
 */
function CheckinSetup({ existingConfig, onComplete, onClose }) {
  const [formData, setFormData] = useState({
    name: existingConfig?.name || '',
    moduleName: existingConfig?.moduleName || '',
    websiteUrl: existingConfig?.websiteUrl || '',
    dailyGoalMinutes: existingConfig?.dailyGoalMinutes || 60,
    restDays: existingConfig?.restDays || [],
    email: existingConfig?.email || '',
  })
  const [emailTestStatus, setEmailTestStatus] = useState(null) // null | 'sending' | 'success' | 'error'

  const dayOptions = [
    { key: 'monday', label: '周一' },
    { key: 'tuesday', label: '周二' },
    { key: 'wednesday', label: '周三' },
    { key: 'thursday', label: '周四' },
    { key: 'friday', label: '周五' },
    { key: 'saturday', label: '周六' },
    { key: 'sunday', label: '周日' },
  ]

  const goalOptions = [30, 60, 90, 120, 180]

  const handleSave = () => {
    if (!formData.name || !formData.moduleName || !formData.websiteUrl || !formData.email) {
      alert('请填写完整信息')
      return
    }

    const config = saveCheckinConfig(formData)
    onComplete?.(config)
  }

  const handleTestEmail = async () => {
    if (!formData.name || !formData.email) {
      alert('请先填写姓名和邮箱')
      return
    }

    setEmailTestStatus('sending')
    const result = await sendTestEmail(formData.email, formData.name)
    setEmailTestStatus(result.success ? 'success' : 'error')

    setTimeout(() => {
      setEmailTestStatus(null)
      if (result.success) {
        alert('📧 测试邮件已发送！请检查你的邮箱。')
      }
    }, 1000)
  }

  const toggleRestDay = (day) => {
    setFormData(prev => ({
      ...prev,
      restDays: prev.restDays.includes(day)
        ? prev.restDays.filter(d => d !== day)
        : [...prev.restDays, day],
    }))
  }

  return (
    <div className="checkin-setup-overlay">
      <div className="checkin-setup">
        <div className="setup-header">
          <h2 className="setup-title">
            {existingConfig ? '打卡设置' : '开启每日打卡'}
          </h2>
          {onClose && (
            <button className="setup-close" onClick={onClose}>×</button>
          )}
        </div>

        <div className="setup-content scrollable">
          {/* 学习模块 */}
          <div className="setup-group">
            <label className="setup-label">学习模块名称</label>
            <input
              type="text"
              className="setup-input"
              placeholder="例如：JavaScript、React、雅思..."
              value={formData.moduleName}
              onChange={e => setFormData(prev => ({ ...prev, moduleName: e.target.value }))}
            />
          </div>

          {/* 学习网站 */}
          <div className="setup-group">
            <label className="setup-label">学习网站链接</label>
            <input
              type="url"
              className="setup-input"
              placeholder="https://..."
              value={formData.websiteUrl}
              onChange={e => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
          </div>

          {/* 每日目标时长 */}
          <div className="setup-group">
            <label className="setup-label">每日目标时长</label>
            <div className="goal-options">
              {goalOptions.map(mins => (
                <button
                  key={mins}
                  type="button"
                  className={`goal-btn ${formData.dailyGoalMinutes === mins ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, dailyGoalMinutes: mins }))}
                >
                  {mins}分钟
                </button>
              ))}
            </div>
          </div>

          {/* 休息日 */}
          <div className="setup-group">
            <label className="setup-label">休息日（可选）</label>
            <div className="rest-days">
              {dayOptions.map(day => (
                <button
                  key={day.key}
                  type="button"
                  className={`rest-day-btn ${formData.restDays.includes(day.key) ? 'active' : ''}`}
                  onClick={() => toggleRestDay(day.key)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* 姓名 */}
          <div className="setup-group">
            <label className="setup-label">姓名（用于邮件称呼）</label>
            <input
              type="text"
              className="setup-input"
              placeholder="你的名字"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* 邮箱 */}
          <div className="setup-group">
            <label className="setup-label">邮箱（用于接收提醒）</label>
            <div className="email-input-row">
              <input
                type="email"
                className="setup-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <button
                type="button"
                className="test-email-btn"
                onClick={handleTestEmail}
                disabled={emailTestStatus === 'sending'}
              >
                {emailTestStatus === 'sending' ? '发送中...' :
                  emailTestStatus === 'success' ? '✓' :
                    emailTestStatus === 'error' ? '✗' : '测试'}
              </button>
            </div>
            <div className="setup-hint">
              当你某天忘记打卡时，会收到提醒邮件
            </div>
          </div>
        </div>

        <div className="setup-footer">
          <button className="setup-save-btn" onClick={handleSave}>
            {existingConfig ? '保存设置' : '开始打卡'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckinPage
