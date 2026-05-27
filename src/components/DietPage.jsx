import React, { useState, useEffect } from 'react'
import BodyInfoForm from './BodyInfoForm'
import CalorieDashboard from './CalorieDashboard'
import MealCard from './MealCard'
import DietHistory from './DietHistory'
import DietAnalysis from './DietAnalysis'
import ExerciseRecommend from './ExerciseRecommend'
import {
  getBodyInfo,
  getDietRecord,
  saveDietRecord,
  getEmptyDietRecord,
  getWeightUpdateTime,
  updateWeight,
  calculateDayTotal,
  calculateBMI,
  getBMIStatus,
  getWeightGoal,
} from '../data/dietStorage'

/**
 * 饮食模块主页
 */
function DietPage({ onBack }) {
  const [bodyInfo, setBodyInfo] = useState(null)
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [todayRecord, setTodayRecord] = useState(null)
  const [showBodyForm, setShowBodyForm] = useState(false)
  const [showWeightReminder, setShowWeightReminder] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showWeightForm, setShowWeightForm] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  // 初始化
  useEffect(() => {
    const info = getBodyInfo()
    setBodyInfo(info)

    if (!info) {
      setShowBodyForm(true)
    } else {
      loadRecord(currentDate)
      checkWeightReminder()
    }
  }, [])

  // 加载某天记录
  const loadRecord = (date) => {
    let record = getDietRecord(date)
    if (!record) {
      record = getEmptyDietRecord(date)
    }
    setTodayRecord(record)
  }

  // 日期切换
  const handleDateChange = (offset) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + offset)
    const newDateStr = date.toISOString().split('T')[0]
    setCurrentDate(newDateStr)
    loadRecord(newDateStr)
  }

  // 身体信息保存完成
  const handleBodyFormComplete = () => {
    const info = getBodyInfo()
    setBodyInfo(info)
    setShowBodyForm(false)
    loadRecord(currentDate)
  }

  // 检查体重提醒
  const checkWeightReminder = () => {
    const lastUpdate = getWeightUpdateTime()
    if (!lastUpdate) return

    const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate >= 7) {
      setShowWeightReminder(true)
    }
  }

  // 更新体重
  const handleUpdateWeight = () => {
    if (!newWeight) return
    updateWeight(parseFloat(newWeight))
    const info = getBodyInfo()
    setBodyInfo(info)
    setShowWeightForm(false)
    setShowWeightReminder(false)
    setNewWeight('')
  }

  // 更新餐次
  const handleMealUpdate = (mealType, updatedMeal) => {
    const newRecord = {
      ...todayRecord,
      meals: {
        ...todayRecord.meals,
        [mealType]: updatedMeal,
      },
    }
    newRecord.totalIntake = calculateDayTotal(newRecord)
    setTodayRecord(newRecord)
    saveDietRecord(newRecord)
  }

  // 格式化日期显示
  const formatDateDisplay = () => {
    const date = new Date(currentDate)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (currentDate === today.toISOString().split('T')[0]) {
      return '今天'
    } else if (currentDate === yesterday.toISOString().split('T')[0]) {
      return '昨天'
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 首次进入身体信息表单
  if (showBodyForm) {
    return <BodyInfoForm onComplete={handleBodyFormComplete} />
  }

  // 体重提醒弹窗
  if (showWeightReminder) {
    return (
      <div className="diet-page">
        <div className="weight-reminder">
          <div className="reminder-icon">⚖️</div>
          <div className="reminder-title">该更新体重啦</div>
          <div className="reminder-message">
            已经超过 7 天没有更新体重了，更新后可以获得更准确的热量预算。
          </div>
          <div className="reminder-actions">
            <button className="reminder-skip" onClick={() => setShowWeightReminder(false)}>
              稍后
            </button>
            <button className="reminder-update" onClick={() => setShowWeightForm(true)}>
              更新体重
            </button>
          </div>
        </div>

        {showWeightForm && (
          <div className="weight-form-overlay">
            <div className="weight-form">
              <div className="weight-form-title">更新体重</div>
              <div className="weight-input-wrapper">
                <input
                  type="number"
                  className="weight-input"
                  placeholder="当前体重"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                />
                <span className="weight-unit">kg</span>
              </div>
              <div className="weight-form-actions">
                <button className="weight-cancel" onClick={() => setShowWeightForm(false)}>
                  取消
                </button>
                <button className="weight-confirm" onClick={handleUpdateWeight}>
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 历史统计视图
  if (showHistory) {
    return (
      <div className="diet-page">
        <div className="diet-header">
          <button className="back-btn" onClick={() => setShowHistory(false)}>
            ‹ 返回
          </button>
          <h2 className="diet-page-title">历史统计</h2>
        </div>

        <div className="diet-content scrollable">
          <DietHistory budget={bodyInfo?.tdee || 2000} />
          <DietAnalysis budget={bodyInfo?.tdee || 2000} />
        </div>
      </div>
    )
  }

  // 主视图
  return (
    <div className="diet-page">
      <div className="diet-header">
        <h2 className="diet-page-title">饮食记录</h2>
        <button className="stats-btn" onClick={() => setShowHistory(true)}>
          📊 统计
        </button>
      </div>

      <div className="diet-content scrollable">
        {/* BMI 显示 - 置顶居中 */}
        {bodyInfo?.weight && bodyInfo?.height && (
          <div className="bmi-display">
            <div className="bmi-label">BMI 身体质量指数</div>
            <div className="bmi-value" style={{ color: getBMIStatus(calculateBMI(bodyInfo.weight, bodyInfo.height)).color }}>
              {calculateBMI(bodyInfo.weight, bodyInfo.height).toFixed(1)}
            </div>
            <div className="bmi-status" style={{ color: getBMIStatus(calculateBMI(bodyInfo.weight, bodyInfo.height)).color }}>
              {getBMIStatus(calculateBMI(bodyInfo.weight, bodyInfo.height)).status}
            </div>
            <div className="bmi-desc">
              {getBMIStatus(calculateBMI(bodyInfo.weight, bodyInfo.height)).description}
            </div>
            {!getWeightGoal(bodyInfo.weight, bodyInfo.height).isNormal && (
              <div className="bmi-goal">
                目标体重 {getWeightGoal(bodyInfo.weight, bodyInfo.height).targetWeight} kg，还需减重
                <span className="goal-weight">{getWeightGoal(bodyInfo.weight, bodyInfo.height).diffWeight}</span> 斤
              </div>
            )}
            {getWeightGoal(bodyInfo.weight, bodyInfo.height).isNormal && (
              <div className="bmi-goal normal">
                已在正常体重范围，保持现状
              </div>
            )}
          </div>
        )}

        {/* 热量仪表盘 */}
        <CalorieDashboard
          budget={bodyInfo?.tdee || 2000}
          intake={todayRecord?.totalIntake || 0}
        />

        {/* 日期选择器 */}
        <div className="date-selector">
          <button className="date-btn" onClick={() => handleDateChange(-1)}>
            ‹
          </button>
          <div className="date-display">{formatDateDisplay()}</div>
          <button
            className="date-btn"
            onClick={() => handleDateChange(1)}
            disabled={currentDate >= new Date().toISOString().split('T')[0]}
          >
            ›
          </button>
        </div>

        {/* 餐次卡片 */}
        <div className="meals-section">
          <MealCard
            mealType="breakfast"
            mealData={todayRecord?.meals?.breakfast || {}}
            onUpdate={(data) => handleMealUpdate('breakfast', data)}
          />
          <MealCard
            mealType="lunch"
            mealData={todayRecord?.meals?.lunch || {}}
            onUpdate={(data) => handleMealUpdate('lunch', data)}
          />
          <MealCard
            mealType="dinner"
            mealData={todayRecord?.meals?.dinner || {}}
            onUpdate={(data) => handleMealUpdate('dinner', data)}
          />
        </div>

        {/* 热量预算信息 */}
        <div className="budget-info">
          <div className="budget-item">
            <span className="budget-label">基础代谢</span>
            <span className="budget-value">{bodyInfo?.bmr || '--'} kcal</span>
          </div>
          <div className="budget-item">
            <span className="budget-label">每日预算</span>
            <span className="budget-value highlight">{bodyInfo?.tdee || '--'} kcal</span>
          </div>
        </div>

        {/* 运动推荐 */}
        <ExerciseRecommend bodyInfo={bodyInfo} />

        {/* 体重快捷更新 */}
        <button className="quick-weight-btn" onClick={() => setShowWeightForm(true)}>
          ⚖️ 更新体重
        </button>
      </div>

      {/* 体重更新弹窗 */}
      {showWeightForm && (
        <div className="weight-form-overlay" onClick={() => setShowWeightForm(false)}>
          <div className="weight-form" onClick={e => e.stopPropagation()}>
            <div className="weight-form-title">更新体重</div>
            <div className="weight-input-wrapper">
              <input
                type="number"
                className="weight-input"
                placeholder="当前体重"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
              />
              <span className="weight-unit">kg</span>
            </div>
            <div className="weight-form-actions">
              <button className="weight-cancel" onClick={() => setShowWeightForm(false)}>
                取消
              </button>
              <button className="weight-confirm" onClick={handleUpdateWeight}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DietPage
