/**
 * 邮件服务模块
 * 使用 EmailJS 实现客户端邮件发送
 */

const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_REMINDER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_REMINDER_TEMPLATE_ID

function getEmailConfig() {
  if (
    !EMAILJS_USER_ID ||
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_TEMPLATE_ID ||
    !EMAILJS_REMINDER_TEMPLATE_ID
  ) {
    return null
  }

  return {
    publicKey: EMAILJS_USER_ID,
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    reminderTemplateId: EMAILJS_REMINDER_TEMPLATE_ID,
  }
}

/**
 * 发送测试邮件
 */
export async function sendTestEmail(email, name) {
  try {
    const config = getEmailConfig()
    if (!config) {
      throw new Error('EmailJS environment variables are not configured')
    }

    const emailjs = (await import('@emailjs/browser')).default

    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      {
        to_name: name || 'InFlow 用户',
        to_email: email,
        module_name: 'InFlow 打卡助手',
        goal_minutes: 60,
        message: `🎉 欢迎 ${name || '小伙伴'}！\n\n从今天开始，就由我来监督你认真学习啦～我们一起把目标慢慢做到！\n\n之后我会记得提醒你别偷懒喔 ✨`,
      },
      config.publicKey
    )

    console.log('✅ 测试邮件发送成功:', result)
    return { success: true, result }
  } catch (error) {
    console.error('❌ 邮件发送失败:', error)
    return { success: false, error }
  }
}

/**
 * 发送未打卡提醒邮件
 */
export async function sendReminderEmail(email, date, moduleName, goalMinutes, name) {
  const dateObj = new Date(date)
  const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`

  const messages = [
    '今天还没有完成你的学习打卡哦～别忘了给未来的自己一点点进步 💪',
    '你的小目标今天还在等你完成呢，我会继续盯着你的 👀',
    '今天不是休息日，要不要花一点时间继续你的 InFlow 学习计划？ ✨',
    '嗨，今天的 InFlow 学习还没完成呢，就差一点点就能打卡成功了！',
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)]

  try {
    const config = getEmailConfig()
    if (!config) {
      throw new Error('EmailJS environment variables are not configured')
    }

    const emailjs = (await import('@emailjs/browser')).default

    const result = await emailjs.send(
      config.serviceId,
      config.reminderTemplateId,
      {
        to_name: name || '小伙伴',
        to_email: email,
        module_name: moduleName,
        goal_minutes: goalMinutes.toString(),
        message: `📚 ${name || '小伙伴'}，你好呀！\n\n今天是 ${dateStr}，你的 ${moduleName} 学习目标还没完成呢。\n\n${randomMessage}\n\n⏱️ 今日目标：${goalMinutes} 分钟\n\n💪 来自 InFlow 每日打卡助手的提醒`,
      },
      config.publicKey
    )

    console.log('✅ 提醒邮件发送成功:', result)
    return { success: true, result }
  } catch (error) {
    console.error('❌ 提醒邮件发送失败:', error)
    return { success: false, error }
  }
}
