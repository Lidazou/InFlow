# InFlow - 情绪记录工具 SPEC

## 1. Concept & Vision

InFlow 是一款极简情绪记录工具，通过"长按蓄力"这一独特交互，将抽象情绪转化为可见的 Emoji 动画与粒子能量流动。整体体验如同在手机上进行一次情绪呼吸练习——按压越久，情绪越强烈，最终以视觉爆发的方式释放。风格借鉴 Apple Watch 健康应用的心流可视化，但更加抽象和艺术化。

## 2. Design Language

### Aesthetic Direction
- 极简未来感：深色背景 + 柔和渐变 + 流动粒子
- 参考：Apple Watch 呼吸 App、心流状态可视化
- Emoji 是绝对视觉主角，其他元素退居次要

### Color Palette
```
Background Base:     #0a0a0f (深空黑)
Background Gradient: #1a1a2e → #16213e → #0f0f23
Accent Cool (low):   #4a90d9 (冷静蓝)
Accent Warm (high): #ff6b6b (热情红)
Accent Hot (max):   #ff4757 (高压红)
Particle Color:      #ffffff @ 30-60% opacity
Text Primary:        #ffffff
Text Secondary:      #8892b0
Glow Effect:         rgba(255, 255, 255, 0.1)
```

### Typography
- Primary Font: system-ui, -apple-system, sans-serif
- Score Display: 48px, bold
- Label Display: 16px, regular
- Button Text: 14px, medium

### Spatial System
- 全屏布局，无滚动
- Emoji 区域占屏幕 40-50%
- 顶部信息区距顶部 10%
- 底部按钮距底部 15%
- 所有元素垂直居中

### Motion Philosophy
- 充气效果：transform: scale()，基于分数平滑插值
- 爆发切换：跨档位时 200ms 的 scale 1.2 + 震动 + blur
- 粒子流动：持续从按钮向上飘散，Canvas 实现
- 所有动画使用 ease-out，避免生硬

## 3. Layout & Structure

```
┌─────────────────────────┐
│      情绪名称              │  ← 顶部 10%
│      分数 0-100           │
├─────────────────────────┤
│                         │
│                         │
│         😃              │  ← 中央 Emoji (40-50% 屏幕)
│                         │
│                         │
├─────────────────────────┤
│                         │
│      [ Press ]          │  ← 底部按钮 15%
│                         │
└─────────────────────────┘
```

### Responsive Strategy
- 移动端优先（320px 最小宽度）
- Emoji 大小根据 vmin 单位缩放
- 按钮大小固定但响应式适配

## 4. Features & Interactions

### 核心交互：长按蓄力

**触发条件：**
- 触摸：touchstart 开始，touchend/touchcancel 结束
- 桌面：mousedown 开始，mouseup/mouseleave 结束

**按压时长映射：**
- 0 秒 → 0 分
- 5 秒 → 100 分
- 超过 5 秒封顶 100 分

**实时反馈：**
1. 分数每帧更新 (requestAnimationFrame)
2. Emoji 根据映射表实时切换
3. Emoji 持续"充气变大"
4. 粒子数量和速度增加
5. 背景色温和度微变

**松手时：**
- 保存记录到 localStorage
- 触发一次释放动画
- 短暂显示保存成功提示

### 情绪映射表

| 分数 | Emoji | 情绪文案 |
|-----|-------|---------|
| 0   | 😐 | 平静 |
| 5   | 🙂 | 微微愉悦 |
| 10  | 😃 | 开心 |
| 15  | 😄 | 高兴 |
| 20  | 😆 | 兴奋 |
| 25  | 😹 | 大笑 |
| 30  | 😅 | 微笑 |
| 35  | 😏 | 得意 |
| 40  | 😠 | 不悦 |
| 45  | 😡 | 生气 |
| 50  | 🤬 | 愤怒爆发 |
| 55  | 😤 | 恼怒 |
| 60  | 😢 | 伤心 |
| 65  | 😖 | 苦恼 |
| 70  | 😱 | 恐惧 |
| 75  | 😭 | 大哭 |
| 80  | 😫 | 疲惫 |
| 85  | 😩 | 沮丧 |
| 90  | 😰 | 焦虑 |
| 95  | 🥵 | 燥热 |
| 100 | 💀 | 完全崩溃 |

## 5. Component Inventory

### EmotionDisplay
- 显示当前情绪名称（大字）
- 显示当前分数（次级文字）
- 状态：idle（默认）、active（按压中）

### EmojiDisplay
- 超大 Emoji 展示
- 状态：
  - idle：正常大小
  - inflating：随分数变大
  - bursting：跨档位爆发动画
- 充气效果：scale 1.0 → 1.5（随分数）
- 爆发效果：scale 1.2 + blur + 回正

### PressButton
- 圆形按钮，带轻微发光边框
- 文字："Press"
- 状态：
  - idle：发光边框
  - pressing：发光增强 + 内圈扩散
  - released：短暂脉冲

### ParticleCanvas
- 全屏 Canvas
- 粒子从按钮位置向上飘向 Emoji
- 粒子数量随按压时间增加

### Background
- 渐变背景
- 背景色温随分数微变

## 6. Technical Approach

### 技术选型
- React 18 + Vite（快速启动）
- 纯 CSS 动画 + requestAnimationFrame
- Canvas API 实现粒子
- localStorage 持久化

### 文件结构
```
inflow/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── EmotionDisplay.jsx
│   │   ├── EmojiDisplay.jsx
│   │   ├── PressButton.jsx
│   │   └── ParticleCanvas.jsx
│   ├── hooks/
│   │   └── useLongPress.js
│   ├── utils/
│   │   └── emotionMap.js
│   └── data/
│       └── localStorage.js
```

### 数据格式
```javascript
// localStorage key: 'inflow_records'
{
  score: number,      // 0-100
  emoji: string,       // emoji 字符
  label: string,       // 情绪文案
  timestamp: number    // Date.now()
}
```

### 动画实现细节
- 充气：CSS transform scale，JavaScript 每帧计算 target scale
- 爆发：CSS keyframe animation + classList toggle
- 粒子：Canvas 2D，粒子对象池，requestAnimationFrame 驱动
