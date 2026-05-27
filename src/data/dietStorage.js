/**
 * 饮食数据 localStorage 管理
 */

const BODY_INFO_KEY = 'inflow_body_info'
const DIET_RECORDS_KEY = 'inflow_diet_records'
const WEIGHT_UPDATE_KEY = 'inflow_weight_update'

/**
 * 保存身体信息
 */
export function saveBodyInfo(info) {
  const data = {
    ...info,
    updatedAt: Date.now(),
  }
  localStorage.setItem(BODY_INFO_KEY, JSON.stringify(data))
  return data
}

/**
 * 获取身体信息
 */
export function getBodyInfo() {
  try {
    const data = localStorage.getItem(BODY_INFO_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * 计算基础代谢 BMR (Mifflin-St Jeor)
 */
export function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

/**
 * 计算每日热量预算 TDEE
 */
export function calculateTDEE(bmr, activityLevel = 'moderate') {
  const multipliers = {
    low: 1.2,
    moderate: 1.55,
    high: 1.725,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.55))
}

/**
 * 计算 BMI
 * @param {number} weight - 体重 kg
 * @param {number} height - 身高 cm
 * @returns {number} BMI 值
 */
export function calculateBMI(weight, height) {
  if (!weight || !height) return 0
  const heightM = height / 100
  return weight / (heightM * heightM)
}

/**
 * 根据 BMI 返回身体状态
 * @param {number} bmi
 * @returns {{ status: string, color: string, description: string }}
 */
export function getBMIStatus(bmi) {
  if (bmi <= 0) return { status: '未知', color: '#888', description: '请先填写身体信息' }
  if (bmi < 18.5) return { status: '偏瘦', color: '#ffb347', description: '建议适当增重，保持营养均衡' }
  if (bmi < 24) return { status: '正常', color: '#64c8ff', description: '体重在健康范围内，继续保持' }
  if (bmi < 28) return { status: '偏胖', color: '#ff9f7f', description: '建议适当控制饮食，增加运动' }
  return { status: '肥胖', color: '#ff6b6b', description: '建议咨询医生，制定减重计划' }
}

/**
 * 计算达到正常 BMI 所需的体重
 * @param {number} weight - 当前体重 kg
 * @param {number} height - 身高 cm
 * @returns {{ targetWeight: number, diffWeight: number, unit: string }}
 */
export function getWeightGoal(weight, height) {
  if (!weight || !height) return { targetWeight: 0, diffWeight: 0, unit: 'kg' }

  const normalBMI = 24
  const heightM = height / 100
  const targetWeight = normalBMI * heightM * heightM
  const diffWeight = weight - targetWeight

  // 如果当前已经是正常体重或偏瘦
  if (diffWeight <= 0) {
    return { targetWeight: targetWeight.toFixed(1), diffWeight: 0, unit: 'kg', isNormal: true }
  }

  // 转换为斤（1kg = 2斤）
  const diffJin = diffWeight * 2

  return {
    targetWeight: targetWeight.toFixed(1),
    diffWeight: diffJin.toFixed(1),
    unit: '斤',
    isNormal: false,
  }
}

/**
 * 获取体重更新时间戳
 */
export function getWeightUpdateTime() {
  try {
    const data = localStorage.getItem(WEIGHT_UPDATE_KEY)
    return data ? JSON.parse(data).timestamp : null
  } catch {
    return null
  }
}

/**
 * 更新体重
 */
export function updateWeight(weight) {
  const data = { weight, timestamp: Date.now() }
  localStorage.setItem(WEIGHT_UPDATE_KEY, JSON.stringify(data))

  // 同时更新身体信息中的体重
  const bodyInfo = getBodyInfo()
  if (bodyInfo) {
    bodyInfo.weight = weight
    bodyInfo.updatedAt = Date.now()
    localStorage.setItem(BODY_INFO_KEY, JSON.stringify(bodyInfo))
  }
  return data
}

/**
 * 获取某一天的饮食记录
 */
export function getDietRecord(date) {
  const records = getAllDietRecords()
  return records.find(r => r.date === date) || null
}

/**
 * 保存某一天的饮食记录
 */
export function saveDietRecord(record) {
  const records = getAllDietRecords()
  const index = records.findIndex(r => r.date === record.date)

  if (index !== -1) {
    records[index] = record
  } else {
    records.push(record)
  }

  // 只保留最近 90 天
  const sorted = records.sort((a, b) => new Date(b.date) - new Date(a.date))
  const trimmed = sorted.slice(0, 90)

  localStorage.setItem(DIET_RECORDS_KEY, JSON.stringify(trimmed))
  return record
}

/**
 * 获取所有饮食记录
 */
export function getAllDietRecords() {
  try {
    const data = localStorage.getItem(DIET_RECORDS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 获取近 N 天饮食记录
 */
export function getRecentDietRecords(days = 7) {
  const records = getAllDietRecords()
  const now = new Date()
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return records
    .filter(r => new Date(r.date) >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * 计算某一天的总热量
 */
export function calculateDayTotal(record) {
  if (!record || !record.meals) return 0

  let total = 0
  const meals = ['breakfast', 'lunch', 'dinner']

  meals.forEach(meal => {
    if (record.meals[meal] && record.meals[meal].totalCalories) {
      total += record.meals[meal].totalCalories
    }
  })

  return total
}

/**
 * 获取默认的空饮食记录
 */
export function getEmptyDietRecord(date) {
  return {
    date,
    meals: {
      breakfast: { image: null, detectedFoods: [], totalCalories: 0 },
      lunch: { image: null, detectedFoods: [], totalCalories: 0 },
      dinner: { image: null, detectedFoods: [], totalCalories: 0 },
    },
    totalIntake: 0,
  }
}

// ============================================
// 运动推荐
// ============================================

/**
 * 运动类型定义
 */
const EXERCISES = {
  cardio: {
    id: 'cardio',
    name: '有氧运动',
    icon: '🏃',
    description: '提升心肺功能，有效燃烧脂肪',
    duration: '30-60分钟',
    examples: '慢跑、游泳、骑行、跳绳',
  },
  hiit: {
    id: 'hiit',
    name: 'HIIT 高强度间歇',
    icon: '⚡',
    description: '短时高效，提升代谢持续燃脂',
    duration: '20-30分钟',
    examples: 'Tabata、波比跳、冲刺训练',
  },
  strength: {
    id: 'strength',
    name: '力量训练',
    icon: '💪',
    description: '增肌塑形，提高基础代谢',
    duration: '40-60分钟',
    examples: '深蹲、硬拉、卧推、引体向上',
  },
  core: {
    id: 'core',
    name: '核心训练',
    icon: '🎯',
    description: '增强核心稳定性，保护腰椎',
    duration: '15-20分钟',
    examples: '平板支撑、卷腹、俄罗斯转体',
  },
  flexibility: {
    id: 'flexibility',
    name: '柔韧拉伸',
    icon: '🧘',
    description: '放松肌肉，预防损伤',
    duration: '10-15分钟',
    examples: '瑜伽、静态拉伸、泡沫轴',
  },
  walking: {
    id: 'walking',
    name: '散步步行',
    icon: '🚶',
    description: '低强度，适合恢复期或初学者',
    duration: '30-60分钟',
    examples: '快走、遛狗、逛街',
  },
}

/**
 * 根据 BMI 和性别推荐运动
 * @param {number} bmi - BMI 值
 * @param {string} gender - 性别 'male' | 'female'
 * @returns {Array} 推荐运动列表
 */
export function getRecommendedExercises(bmi, gender = 'male') {
  let recommendations = []

  if (bmi <= 0) {
    // 无数据，返回基础推荐
    return [
      { ...EXERCISES.walking, reason: '先从轻度运动开始' },
      { ...EXERCISES.flexibility, reason: '养成拉伸习惯' },
    ]
  }

  if (bmi < 18.5) {
    // 偏瘦 — 增肌为主
    recommendations = [
      { ...EXERCISES.strength, reason: '增肌塑形，提高体重' },
      { ...EXERCISES.core, reason: '强化核心，提升姿态' },
    ]
    if (gender === 'female') {
      recommendations.push({ ...EXERCISES.flexibility, reason: '改善柔韧性' })
    } else {
      recommendations.push({ ...EXERCISES.hiit, reason: '适度增肌不增脂' })
    }
  } else if (bmi < 24) {
    // 正常 — 保持健康
    recommendations = [
      { ...EXERCISES.cardio, reason: '保持心肺健康' },
      { ...EXERCISES.core, reason: '增强核心稳定性' },
    ]
    if (gender === 'male') {
      recommendations.push({ ...EXERCISES.strength, reason: '维持肌肉量' })
    } else {
      recommendations.push({ ...EXERCISES.flexibility, reason: '保持身体灵活性' })
    }
  } else if (bmi < 28) {
    // 偏胖 — 减脂为主
    recommendations = [
      { ...EXERCISES.cardio, reason: '高效燃烧脂肪' },
      { ...EXERCISES.hiit, reason: '提升代谢，持续燃脂' },
      { ...EXERCISES.core, reason: '紧致腰腹线条' },
    ]
  } else {
    // 肥胖 — 安全减重
    recommendations = [
      { ...EXERCISES.walking, reason: '保护关节，低强度起步' },
      { ...EXERCISES.flexibility, reason: '放松身心，减少压力' },
    ]
    if (gender === 'male') {
      recommendations.push({ ...EXERCISES.strength, reason: '增肌提高基础代谢' })
    } else {
      recommendations.push({ ...EXERCISES.cardio, reason: '循序渐进燃脂' })
    }
  }

  return recommendations
}
