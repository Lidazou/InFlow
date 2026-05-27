/**
 * localStorage 数据管理
 */

const STORAGE_KEY = 'inflow_records'

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 保存一条情绪记录
 * @param {object} emotionData
 * @param {number} emotionData.score - 0-100
 * @param {string} emotionData.emoji - emoji 字符
 * @param {string} emotionData.label - 情绪文案
 * @param {string} [emotionData.reason] - 原因（可选）
 */
export function saveEmotionRecord(emotionData, reason = '') {
  const record = {
    id: generateId(),
    score: emotionData.score,
    emoji: emotionData.emoji,
    label: emotionData.label,
    reason: reason,
    timestamp: Date.now(),
  }

  const existing = getAllRecords()
  existing.unshift(record) // 最新记录在前

  // 最多保存 100 条
  const trimmed = existing.slice(0, 100)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return record
}

/**
 * 更新单条记录的 reason
 * @param {string} id - 记录 ID
 * @param {string} reason - 原因文本
 */
export function updateRecordReason(id, reason) {
  const records = getAllRecords()
  const index = records.findIndex(r => r.id === id)
  if (index !== -1) {
    records[index].reason = reason
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    return records[index]
  }
  return null
}

/**
 * 获取所有记录
 */
export function getAllRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 获取最近 N 条记录
 * @param {number} n
 */
export function getRecentRecords(n = 7) {
  const all = getAllRecords()
  return all.slice(0, n)
}

/**
 * 清除所有记录
 */
export function clearAllRecords() {
  localStorage.removeItem(STORAGE_KEY)
}
