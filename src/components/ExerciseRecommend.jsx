import React from 'react'
import { getRecommendedExercises, calculateBMI } from '../data/dietStorage'

/**
 * 运动推荐组件
 */
function ExerciseRecommend({ bodyInfo }) {
  if (!bodyInfo) return null

  const bmi = calculateBMI(bodyInfo.weight, bodyInfo.height)
  const exercises = getRecommendedExercises(bmi, bodyInfo.gender)

  return (
    <div className="exercise-recommend">
      <div className="exercise-header">
        <div className="exercise-title">今日运动推荐</div>
        <div className="exercise-subtitle">
          BMI {bmi > 0 ? bmi.toFixed(1) : '--'}
        </div>
      </div>

      <div className="exercise-list">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="exercise-card">
            <div className="exercise-card-header">
              <span className="exercise-icon">{exercise.icon}</span>
              <div className="exercise-info">
                <div className="exercise-name">{exercise.name}</div>
                <div className="exercise-reason">{exercise.reason}</div>
              </div>
              <div className="exercise-duration">{exercise.duration}</div>
            </div>
            <div className="exercise-desc">{exercise.description}</div>
            <div className="exercise-examples">
              <span className="examples-label">适合:</span> {exercise.examples}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExerciseRecommend