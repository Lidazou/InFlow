/**
 * 情绪映射表
 * 每 5 分一个档位，从 0 到 100
 * emoji: 对应的表情
 * label: 情绪文案
 */

export const EMOTION_MAP = [
  { score: 0,   emoji: '😐', label: '平静' },
  { score: 5,   emoji: '🙂', label: '微微愉悦' },
  { score: 10,  emoji: '😃', label: '开心' },
  { score: 15,  emoji: '😄', label: '高兴' },
  { score: 20,  emoji: '😆', label: '兴奋' },
  { score: 25,  emoji: '😹', label: '大笑' },
  { score: 30,  emoji: '😅', label: '微笑' },
  { score: 35,  emoji: '😏', label: '得意' },
  { score: 40,  emoji: '😠', label: '不悦' },
  { score: 45,  emoji: '😡', label: '生气' },
  { score: 50,  emoji: '🤬', label: '愤怒爆发' },
  { score: 55,  emoji: '😤', label: '恼怒' },
  { score: 60,  emoji: '😢', label: '伤心' },
  { score: 65,  emoji: '😖', label: '苦恼' },
  { score: 70,  emoji: '😱', label: '恐惧' },
  { score: 75,  emoji: '😭', label: '大哭' },
  { score: 80,  emoji: '😫', label: '疲惫' },
  { score: 85,  emoji: '😩', label: '沮丧' },
  { score: 90,  emoji: '😰', label: '焦虑' },
  { score: 95,  emoji: '🥵', label: '燥热' },
  { score: 100, emoji: '💀', label: '完全崩溃' },
]

/**
 * 根据分数获取对应的情绪数据
 * @param {number} score 0-100
 * @returns {{ emoji: string, label: string, score: number }}
 */
export function getEmotionByScore(score) {
  // 确保分数在有效范围内
  score = Math.max(0, Math.min(100, score))

  // 找到最接近的档位
  let closest = EMOTION_MAP[0]
  for (const emotion of EMOTION_MAP) {
    if (emotion.score <= score) {
      closest = emotion
    } else {
      break
    }
  }

  return closest
}

/**
 * 获取当前分数所在的档位 index
 * @param {number} score
 * @returns {number}
 */
export function getEmotionIndex(score) {
  score = Math.max(0, Math.min(100, score))
  for (let i = EMOTION_MAP.length - 1; i >= 0; i--) {
    if (EMOTION_MAP[i].score <= score) {
      return i
    }
  }
  return 0
}
