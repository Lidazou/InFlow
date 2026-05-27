import React from 'react'

/**
 * Press 按钮组件
 * 带发光边框效果
 */
function PressButton({ isPressing, onPressStart, onPressEnd }) {
  return (
    <div className="press-button-wrapper">
      <button
        className={`press-button ${isPressing ? 'pressing' : ''}`}
        onMouseDown={onPressStart}
        onMouseUp={onPressEnd}
        onMouseLeave={onPressEnd}
        onTouchStart={onPressStart}
        onTouchEnd={onPressEnd}
        onTouchCancel={onPressEnd}
      >
        <span className="press-text">Press</span>
      </button>
    </div>
  )
}

export default PressButton
