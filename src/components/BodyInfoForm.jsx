import React, { useState } from 'react'
import {
  saveBodyInfo,
  calculateBMR,
  calculateTDEE,
  getBodyInfo,
} from '../data/dietStorage'

/**
 * 身体信息采集表单
 * 首次进入饮食模块时引导填写
 */
function BodyInfoForm({ onComplete }) {
  const existingInfo = getBodyInfo()

  const [formData, setFormData] = useState({
    gender: existingInfo?.gender || '',
    age: existingInfo?.age || '',
    height: existingInfo?.height || '',
    weight: existingInfo?.weight || '',
    goal: existingInfo?.goal || 'maintain',
    activityLevel: existingInfo?.activityLevel || 'moderate',
  })

  const [errors, setErrors] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState({ bmr: 0, tdee: 0 })

  const validate = () => {
    const errs = {}

    if (!formData.gender) errs.gender = '请选择性别'
    if (!formData.age || formData.age < 10 || formData.age > 120) {
      errs.age = '请输入有效年龄'
    }
    if (!formData.height || formData.height < 100 || formData.height > 250) {
      errs.height = '请输入有效身高(cm)'
    }
    if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
      errs.weight = '请输入有效体重(kg)'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const bmr = calculateBMR(
      parseFloat(formData.weight),
      parseFloat(formData.height),
      parseInt(formData.age),
      formData.gender
    )

    const tdee = calculateTDEE(bmr, formData.activityLevel)

    saveBodyInfo({
      gender: formData.gender,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      goal: formData.goal,
      activityLevel: formData.activityLevel,
      bmr: Math.round(bmr),
      tdee,
    })

    setResult({ bmr: Math.round(bmr), tdee })
    setShowResult(true)
  }

  if (showResult) {
    return (
      <div className="body-info-form">
        <div className="form-header">
          <h2 className="form-title">您的热量预算</h2>
          <p className="form-subtitle">基于身体信息计算得出</p>
        </div>

        <div className="calorie-result">
          <div className="calorie-item">
            <div className="calorie-value">{result.tdee}</div>
            <div className="calorie-label">每日预算 (kcal)</div>
          </div>
          <div className="calorie-divider" />
          <div className="calorie-item small">
            <div className="calorie-value">{result.bmr}</div>
            <div className="calorie-label">基础代谢</div>
          </div>
        </div>

        <div className="goal-info">
          <span className="goal-tag">
            {formData.goal === 'lose' ? '减脂' : formData.goal === 'gain' ? '增肌' : '维持'}
          </span>
          <span className="activity-tag">
            活动水平：{formData.activityLevel === 'low' ? '低' : formData.activityLevel === 'high' ? '高' : '中'}
          </span>
        </div>

        <button className="form-submit-btn" onClick={onComplete}>
          开始记录
        </button>
      </div>
    )
  }

  return (
    <div className="body-info-form">
      <div className="form-header">
        <h2 className="form-title">欢迎使用饮食记录</h2>
        <p className="form-subtitle">先告诉我们一些关于您的信息</p>
      </div>

      <div className="form-group">
        <label className="form-label">性别</label>
        <div className="gender-options">
          <button
            type="button"
            className={`gender-btn ${formData.gender === 'male' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, gender: 'male' })}
          >
            <span className="gender-icon">♂</span>
            <span>男</span>
          </button>
          <button
            type="button"
            className={`gender-btn ${formData.gender === 'female' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, gender: 'female' })}
          >
            <span className="gender-icon">♀</span>
            <span>女</span>
          </button>
        </div>
        {errors.gender && <span className="form-error">{errors.gender}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">年龄</label>
          <input
            type="number"
            className="form-input"
            placeholder="25"
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
          />
          {errors.age && <span className="form-error">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">身高 (cm)</label>
          <input
            type="number"
            className="form-input"
            placeholder="170"
            value={formData.height}
            onChange={e => setFormData({ ...formData, height: e.target.value })}
          />
          {errors.height && <span className="form-error">{errors.height}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">当前体重 (kg)</label>
        <input
          type="number"
          className="form-input"
          placeholder="65"
          value={formData.weight}
          onChange={e => setFormData({ ...formData, weight: e.target.value })}
        />
        {errors.weight && <span className="form-error">{errors.weight}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">目标</label>
        <div className="goal-options">
          <button
            type="button"
            className={`goal-btn ${formData.goal === 'lose' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, goal: 'lose' })}
          >
            减脂
          </button>
          <button
            type="button"
            className={`goal-btn ${formData.goal === 'maintain' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, goal: 'maintain' })}
          >
            维持
          </button>
          <button
            type="button"
            className={`goal-btn ${formData.goal === 'gain' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, goal: 'gain' })}
          >
            增肌
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">活动水平</label>
        <div className="activity-options">
          <button
            type="button"
            className={`activity-btn ${formData.activityLevel === 'low' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, activityLevel: 'low' })}
          >
            <div className="activity-icon">🧘</div>
            <div className="activity-text">低</div>
            <div className="activity-desc">久坐为主</div>
          </button>
          <button
            type="button"
            className={`activity-btn ${formData.activityLevel === 'moderate' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, activityLevel: 'moderate' })}
          >
            <div className="activity-icon">🚶</div>
            <div className="activity-text">中</div>
            <div className="activity-desc">偶尔运动</div>
          </button>
          <button
            type="button"
            className={`activity-btn ${formData.activityLevel === 'high' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, activityLevel: 'high' })}
          >
            <div className="activity-icon">🏃</div>
            <div className="activity-text">高</div>
            <div className="activity-desc">经常运动</div>
          </button>
        </div>
      </div>

      <button className="form-submit-btn" onClick={handleSubmit}>
        计算热量预算
      </button>
    </div>
  )
}

export default BodyInfoForm
