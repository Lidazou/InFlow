import React, { useState, useRef } from 'react'
import EmojiDisplay from './components/EmojiDisplay'
import ParticleCanvas from './components/ParticleCanvas'
import SplashScreen from './components/SplashScreen'
import ReasonInput from './components/ReasonInput'
import HistoryPage from './components/HistoryPage'
import DietPage from './components/DietPage'
import CheckinPage from './components/CheckinPage'
import { getEmotionByScore } from './utils/emotionMap'
import { saveEmotionRecord, updateRecordReason } from './data/localStorage'

const MAX_DURATION = 5000

function App() {
  // 页面状态
  const [currentPage, setCurrentPage] = useState('home') // home | history | diet | checkin
  const [showSplash, setShowSplash] = useState(true)
  const [showMain, setShowMain] = useState(false)

  // 情绪记录状态
  const [score, setScore] = useState(0)
  const [emotion, setEmotion] = useState(getEmotionByScore(0))
  const [isPressing, setIsPressing] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // 原因输入状态
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [pendingRecord, setPendingRecord] = useState(null)

  // refs
  const isPressingRef = useRef(false)
  const startTimeRef = useRef(null)
  const animationRef = useRef(null)
  const savedScoreRef = useRef(0)

  // 开屏动画完成
  const handleSplashComplete = () => {
    setShowSplash(false)
    setShowMain(true)
  }

  const calculateScore = () => {
    if (!isPressingRef.current || !startTimeRef.current) return 0
    const elapsed = Date.now() - startTimeRef.current
    return Math.min(100, (elapsed / MAX_DURATION) * 100)
  }

  const updateLoop = () => {
    if (!isPressingRef.current) return
    const currentScore = calculateScore()
    savedScoreRef.current = currentScore
    setScore(currentScore)
    setEmotion(getEmotionByScore(currentScore))
    animationRef.current = requestAnimationFrame(updateLoop)
  }

  const handlePressStart = (e) => {
    e.preventDefault()
    isPressingRef.current = true
    startTimeRef.current = Date.now()
    setIsPressing(true)
    animationRef.current = requestAnimationFrame(updateLoop)
  }

  const handlePressEnd = () => {
    if (!isPressingRef.current) return
    isPressingRef.current = false
    setIsPressing(false)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    const finalScore = savedScoreRef.current

    if (finalScore > 0) {
      const finalEmotion = getEmotionByScore(finalScore)
      const record = saveEmotionRecord({
        score: Math.round(finalScore),
        emoji: finalEmotion.emoji,
        label: finalEmotion.label,
      })

      setPendingRecord(record)
      setShowReasonInput(true)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }

    setTimeout(() => {
      setScore(0)
      setEmotion(getEmotionByScore(0))
    }, 800)
  }

  const handleSaveReason = (reason) => {
    if (pendingRecord) {
      updateRecordReason(pendingRecord.id, reason)
    }
    setShowReasonInput(false)
    setPendingRecord(null)
  }

  const handleSkipReason = () => {
    setShowReasonInput(false)
    setPendingRecord(null)
  }

  const bgIntensity = score / 100
  const bgStyle = {
    background: currentPage === 'diet' ? '#0a0a0f' : `
      radial-gradient(ellipse at 50% 35%,
        hsl(${220 - bgIntensity * 40}, ${30 + bgIntensity * 30}%, ${10 + bgIntensity * 5}%)
        0%,
        hsl(${240 - bgIntensity * 60}, 40%, 6%) 50%,
        hsl(${260 - bgIntensity * 80}, 30%, 4%) 100%
      )
    `,
  }

  return (
    <div className="app" style={bgStyle}>
      {/* 开屏动画 */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* 主页面内容 */}
      {showMain && (
        <>
          {/* 情绪/饮食页面才有粒子效果 */}
          {currentPage !== 'diet' && (
            <ParticleCanvas isActive={isPressing} intensity={0.2 + (score / 100) * 0.8} />
          )}

          {/* 首页 */}
          {currentPage === 'home' && (
            <div className="main-content">
              <div style={{ textAlign: 'center' }}>
                <div className={`emotion-label ${isPressing ? 'active' : ''}`}>
                  {emotion.label}
                </div>
                <div className={`emotion-score ${isPressing ? 'active' : ''}`}>
                  {Math.round(score)}
                  <span className="score-suffix">分</span>
                </div>
              </div>

              <div className="emoji-wrapper">
                <EmojiDisplay emoji={emotion.emoji} score={score} />
              </div>

              <button
                className={`press-button ${isPressing ? 'pressing' : ''}`}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onTouchCancel={handlePressEnd}
              >
                <span className="press-text">Press</span>
              </button>
            </div>
          )}

          {/* 历史页面 */}
          {currentPage === 'history' && <HistoryPage />}

          {/* 饮食页面 */}
          {currentPage === 'diet' && <DietPage />}

          {/* 每日打卡页面 */}
          {currentPage === 'checkin' && <CheckinPage />}

          {/* 底部导航 */}
          <nav className="bottom-nav">
            <div
              className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              <span className="nav-icon">💫</span>
              <span>记录</span>
            </div>
            <div
              className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentPage('history')}
            >
              <span className="nav-icon">📊</span>
              <span>历史</span>
            </div>
            <div
              className={`nav-item ${currentPage === 'diet' ? 'active' : ''}`}
              onClick={() => setCurrentPage('diet')}
            >
              <span className="nav-icon">🍽️</span>
              <span>饮食</span>
            </div>
            <div
              className={`nav-item ${currentPage === 'checkin' ? 'active' : ''}`}
              onClick={() => setCurrentPage('checkin')}
            >
              <span className="nav-icon">✓</span>
              <span>打卡</span>
            </div>
          </nav>

          {/* 保存提示 */}
          {showSaved && !showReasonInput && currentPage === 'home' && (
            <div className="saved-toast">
              <span className="saved-icon">✓</span>
              <span>已保存</span>
            </div>
          )}

          {/* 原因输入面板 */}
          <ReasonInput
            visible={showReasonInput}
            emoji={pendingRecord?.emoji || emotion.emoji}
            label={pendingRecord?.label || emotion.label}
            score={pendingRecord?.score || Math.round(score)}
            onSave={handleSaveReason}
            onSkip={handleSkipReason}
          />
        </>
      )}
    </div>
  )
}

export default App
