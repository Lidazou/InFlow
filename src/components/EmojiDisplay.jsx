import React, { useState, useEffect, useRef } from 'react'

/**
 * Emoji 显示组件
 * - 充气：分数变化立即影响 scale
 * - 爆发切换：跨档位时立即切换 emoji + 爆发动画
 */
function EmojiDisplay({ emoji, score }) {
  const [displayEmoji, setDisplayEmoji] = useState(emoji)
  const [isBursting, setIsBursting] = useState(false)
  const prevEmojiRef = useRef(emoji)
  const burstTimeoutRef = useRef(null)

  // 当前档位
  const currentTier = Math.floor(score / 5)
  const prevTierRef = useRef(0)

  // 1. 实时充气效果：分数变化立即更新 scale
  const currentScale = 1 + (score / 100) * 0.6

  // 2. emoji 变化时立即切换
  useEffect(() => {
    // 检测到新的 emoji（跨档位）
    if (emoji !== prevEmojiRef.current) {
      // 清除之前的 timeout
      if (burstTimeoutRef.current) {
        clearTimeout(burstTimeoutRef.current)
      }

      // 立即切换 emoji
      setDisplayEmoji(emoji)

      // 触发爆发动画
      setIsBursting(true)

      // 350ms 后结束爆发
      burstTimeoutRef.current = setTimeout(() => {
        setIsBursting(false)
      }, 350)

      prevEmojiRef.current = emoji
      prevTierRef.current = currentTier
    }
  }, [emoji, currentTier])

  // 构建 class
  const classNames = ['emoji-display']
  if (isBursting) classNames.push('bursting')
  else if (score > 5) classNames.push('inflating')

  return (
    <div
      className={classNames.join(' ')}
      style={{
        transform: `scale(${currentScale})`,
      }}
    >
      <span className="emoji-char">{displayEmoji}</span>
    </div>
  )
}

export default EmojiDisplay
