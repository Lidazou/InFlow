/**
 * 每日打卡数据 localStorage 管理
 */

const CHECKIN_CONFIG_KEY = 'inflow_checkin_config'
const CHECKIN_RECORDS_KEY = 'inflow_checkin_records'
const CHECKIN_REMINDERS_KEY = 'inflow_checkin_reminders'

/**
 * 保存打卡配置
 */
export function saveCheckinConfig(config) {
  const data = {
    ...config,
    createdAt: config.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
  localStorage.setItem(CHECKIN_CONFIG_KEY, JSON.stringify(data))
  return data
}

/**
 * 获取打卡配置
 */
export function getCheckinConfig() {
  try {
    const data = localStorage.getItem(CHECKIN_CONFIG_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * 检查今天是否是休息日
 */
export function isRestDay(config) {
  if (!config || !config.restDays || config.restDays.length === 0) {
    return false
  }
  const today = new Date()
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()]
  return config.restDays.includes(dayOfWeek)
}

/**
 * 获取今天的打卡记录
 */
export function getTodayRecord() {
  const today = new Date().toISOString().split('T')[0]
  const records = getAllRecords()
  return records.find(r => r.date === today) || null
}

/**
 * 获取某一天的打卡记录
 */
export function getRecordByDate(date) {
  const records = getAllRecords()
  return records.find(r => r.date === date) || null
}

/**
 * 保存打卡记录
 */
export function saveCheckinRecord(record) {
  const records = getAllRecords()
  const index = records.findIndex(r => r.date === record.date)

  if (index !== -1) {
    records[index] = record
  } else {
    records.push(record)
  }

  // 按日期降序排序
  records.sort((a, b) => new Date(b.date) - new Date(a.date))

  // 最多保留 90 天
  const trimmed = records.slice(0, 90)

  localStorage.setItem(CHECKIN_RECORDS_KEY, JSON.stringify(trimmed))
  return record
}

/**
 * 获取所有打卡记录
 */
export function getAllRecords() {
  try {
    const data = localStorage.getItem(CHECKIN_RECORDS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 获取近 N 天记录
 */
export function getRecentRecords(days = 7) {
  const records = getAllRecords()
  const now = new Date()
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return records.filter(r => new Date(r.date) >= cutoff)
}

/**
 * 获取连续打卡天数
 */
export function getStreak() {
  const records = getAllRecords()
  const config = getCheckinConfig()

  if (!config) return 0

  let streak = 0
  const today = new Date()

  // 从今天往前检查
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const record = records.find(r => r.date === dateStr)

    // 如果是休息日，跳过
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
    if (config.restDays.includes(dayOfWeek)) {
      continue
    }

    // 如果没有记录或未完成，中断
    if (!record || !record.completed) {
      // 今天还没完成，不中断连续
      if (i === 0) continue
      break
    }

    streak++
  }

  return streak
}

/**
 * 记录提醒发送状态
 */
export function setReminderSent(date) {
  const reminders = getReminderRecords()
  reminders[date] = true
  localStorage.setItem(CHECKIN_REMINDERS_KEY, JSON.stringify(reminders))
}

/**
 * 检查某天是否已发送提醒
 */
export function hasReminderSent(date) {
  const reminders = getReminderRecords()
  return !!reminders[date]
}

/**
 * 获取所有提醒记录
 */
function getReminderRecords() {
  try {
    const data = localStorage.getItem(CHECKIN_REMINDERS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

/**
 * 获取本周完成情况
 */
export function getWeekProgress() {
  const records = getAllRecords()
  const config = getCheckinConfig()
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weekData = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const record = records.find(r => r.date === dateStr)

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
    const isRestDay = config?.restDays?.includes(dayOfWeek) || false

    weekData.push({
      date: dateStr,
      dayName: ['日', '一', '二', '三', '四', '五', '六'][i],
      completed: record?.completed || false,
      studiedMinutes: record?.studiedMinutes || 0,
      isRestDay,
      isFuture: date > today,
      isToday: dateStr === today.toISOString().split('T')[0],
    })
  }

  return weekData
}

/**
 * 检查并发送未打卡提醒
 */
export function checkAndSendReminder(sendEmailFn) {
  const config = getCheckinConfig()
  if (!config || !config.email) return

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayRecord = getRecordByDate(yesterdayStr)

  // 检查昨天是否是休息日
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][yesterday.getDay()]
  const wasRestDay = config.restDays.includes(dayOfWeek)

  // 如果昨天不是休息日，且没有完成打卡，且没有发送过提醒
  if (!wasRestDay && (!yesterdayRecord || !yesterdayRecord.completed) && !hasReminderSent(yesterdayStr)) {
    sendEmailFn(config.email, yesterdayStr)
    setReminderSent(yesterdayStr)
  }
}
