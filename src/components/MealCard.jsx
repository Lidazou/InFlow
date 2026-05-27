import React, { useState, useRef } from 'react'
import { recognizeFood } from '../services/foodRecognition'

/**
 * 餐次卡片组件
 * 支持图片上传、食物识别、编辑
 */
function MealCard({ mealType, mealData, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef(null)

  const mealLabels = {
    breakfast: { name: '早餐', icon: '🌅', time: '07:00-09:00' },
    lunch: { name: '午餐', icon: '☀️', time: '12:00-14:00' },
    dinner: { name: '晚餐', icon: '🌙', time: '18:00-20:00' },
  }

  const label = mealLabels[mealType]

  // 处理图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageDataUrl = event.target.result

      // 显示图片
      const newMealData = {
        ...mealData,
        image: imageDataUrl,
      }
      onUpdate(newMealData)

      // 开始识别
      setIsRecognizing(true)
      try {
        const result = await recognizeFood(imageDataUrl)
        onUpdate({
          ...newMealData,
          detectedFoods: result.foods,
          totalCalories: result.totalCalories,
          recognizedAt: Date.now(),
        })
      } catch (error) {
        console.error('Recognition failed:', error)
      } finally {
        setIsRecognizing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // 删除食物项
  const handleDeleteFood = (foodId) => {
    const newFoods = mealData.detectedFoods.filter(f => f.id !== foodId)
    const totalCalories = newFoods.reduce((sum, f) => sum + f.estimatedCalories, 0)
    onUpdate({
      ...mealData,
      detectedFoods: newFoods,
      totalCalories,
      manualEdited: true,
    })
  }

  // 编辑食物项
  const handleEditFood = (foodId, field, value) => {
    const newFoods = mealData.detectedFoods.map(f => {
      if (f.id === foodId) {
        const updated = { ...f, [field]: value }
        // 如果编辑了名称，重新估算热量
        if (field === 'name') {
          updated.estimatedCalories = Math.round(value.length * 10) // 简化估算
        }
        return updated
      }
      return f
    })
    const totalCalories = newFoods.reduce((sum, f) => sum + f.estimatedCalories, 0)
    onUpdate({
      ...mealData,
      detectedFoods: newFoods,
      totalCalories,
      manualEdited: true,
    })
  }

  // 添加食物
  const handleAddFood = () => {
    const newFood = {
      id: `food_${Date.now()}`,
      name: '',
      confidence: 1,
      estimatedCalories: 100,
    }
    onUpdate({
      ...mealData,
      detectedFoods: [...mealData.detectedFoods, newFood],
      totalCalories: mealData.totalCalories + 100,
      manualEdited: true,
    })
  }

  // 更新热量
  const handleCaloriesChange = (value) => {
    const calories = Math.max(0, parseInt(value) || 0)
    onUpdate({
      ...mealData,
      totalCalories: calories,
      manualEdited: true,
    })
  }

  return (
    <div className="meal-card">
      <div className="meal-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="meal-info">
          <span className="meal-icon">{label.icon}</span>
          <span className="meal-name">{label.name}</span>
          <span className="meal-time">{label.time}</span>
        </div>
        <div className="meal-summary">
          {mealData.totalCalories > 0 && (
            <span className="meal-calories">{mealData.totalCalories} kcal</span>
          )}
          <span className={`meal-arrow ${isExpanded ? 'up' : ''}`}>›</span>
        </div>
      </div>

      {isExpanded && (
        <div className="meal-content">
          {/* 图片区域 */}
          {mealData.image ? (
            <div className="meal-image-wrapper">
              <img src={mealData.image} alt={label.name} className="meal-image" />
              {isRecognizing && (
                <div className="recognizing-overlay">
                  <div className="recognizing-spinner" />
                  <span>识别中...</span>
                </div>
              )}
              <button
                className="change-image-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                更换图片
              </button>
            </div>
          ) : (
            <div
              className="meal-upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📷</div>
              <div className="upload-text">点击上传 {label.name} 照片</div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          {/* 识别结果 */}
          {mealData.detectedFoods && mealData.detectedFoods.length > 0 && (
            <div className="detected-foods">
              <div className="foods-header">
                <span className="foods-title">识别结果</span>
                <button className="edit-foods-btn" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? '完成' : '编辑'}
                </button>
              </div>

              <div className="foods-list">
                {mealData.detectedFoods.map(food => (
                  <div key={food.id} className="food-item">
                    {isEditing ? (
                      <div className="food-edit">
                        <input
                          type="text"
                          className="food-name-input"
                          value={food.name}
                          onChange={e => handleEditFood(food.id, 'name', e.target.value)}
                          placeholder="食物名称"
                        />
                        <div className="food-calories-edit">
                          <input
                            type="number"
                            className="food-calories-input"
                            value={food.estimatedCalories}
                            onChange={e => handleEditFood(food.id, 'estimatedCalories', parseInt(e.target.value))}
                          />
                          <span className="calories-unit">kcal</span>
                        </div>
                        <button
                          className="food-delete-btn"
                          onClick={() => handleDeleteFood(food.id)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="food-display">
                        <span className="food-name">{food.name}</span>
                        <span className="food-calories">{food.estimatedCalories} kcal</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <button className="add-food-btn" onClick={handleAddFood}>
                  + 添加食物
                </button>
              )}

              <div className="meal-total">
                <span>小计</span>
                <div className="total-edit">
                  <input
                    type="number"
                    value={mealData.totalCalories}
                    onChange={e => handleCaloriesChange(e.target.value)}
                    disabled={!isEditing}
                  />
                  <span>kcal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MealCard
