import { useCallback, useRef } from 'react'

/**
 * 长按蓄力 Hook
 * @param {Function} onProgress - 实时回调，参数为 0-100 的分数
 * @param {Function} onRelease - 松手回调，参数为最终分数
 * @param {number} maxDuration - 最大按压时长(ms)，默认 5000ms
 */
export function useLongPress(
  onProgress,
  onRelease,
  maxDuration = 5000
) {
  const isPressingRef = useRef(false)
  const startTimeRef = useRef(null)
  const animationFrameRef = useRef(null)

  // 计算当前分数
  const calculateScore = useCallback(() => {
    if (!isPressingRef.current || !startTimeRef.current) return 0

    const elapsed = Date.now() - startTimeRef.current
    const score = Math.min(100, (elapsed / maxDuration) * 100)
    return score
  }, [maxDuration])

  // 动画循环
  const animationLoop = useCallback(() => {
    if (!isPressingRef.current) return

    const score = calculateScore()
    onProgress?.(score)

    animationFrameRef.current = requestAnimationFrame(animationLoop)
  }, [calculateScore, onProgress])

  // 开始按压
  const handleStart = useCallback((e) => {
    e.preventDefault()
    isPressingRef.current = true
    startTimeRef.current = Date.now()

    // 立即触发一次
    onProgress?.(0)
    animationFrameRef.current = requestAnimationFrame(animationLoop)
  }, [onProgress, animationLoop])

  // 结束按压
  const handleEnd = useCallback(() => {
    if (!isPressingRef.current) return

    isPressingRef.current = false

    // 取消动画循环
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // 计算最终分数
    const finalScore = calculateScore()
    onRelease?.(finalScore)

    // 重置
    startTimeRef.current = null
  }, [calculateScore, onRelease])

  // 取消按压
  const handleCancel = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  return {
    isPressing: isPressingRef.current,
    handlers: {
      onMouseDown: handleStart,
      onMouseUp: handleEnd,
      onMouseLeave: handleCancel,
      onTouchStart: handleStart,
      onTouchEnd: handleEnd,
      onTouchCancel: handleCancel,
    },
  }
}
