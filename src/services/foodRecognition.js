/**
 * 食物识别服务
 *
 * 当前为 MOCK 实现，提供可替换的接口
 * 未来可接入 YOLO 或其他图像识别服务
 *
 * 接口设计：
 * - recognizeFood(imageData): Promise<RecognitionResult>
 * - RecognitionResult: { foods: FoodItem[], totalCalories: number }
 * - FoodItem: { name: string, confidence: number, estimatedCalories: number }
 */

// 常见食物热量表 (每100g 大致热量)
const FOOD_CALORIE_TABLE = {
  // 主食类
  rice: { name: '米饭', calories: 130 },
  noodles: { name: '面条', calories: 140 },
  bread: { name: '面包', calories: 265 },
 馒头: { name: '馒头', calories: 220 },
 饺子: { name: '饺子', calories: 250 },

  // 肉类
  chicken: { name: '鸡肉', calories: 165 },
  beef: { name: '牛肉', calories: 250 },
  pork: { name: '猪肉', calories: 270 },
  fish: { name: '鱼肉', calories: 90 },
  shrimp: { name: '虾', calories: 85 },

  // 蔬菜类
  broccoli: { name: '西兰花', calories: 34 },
  cabbage: { name: '白菜', calories: 18 },
  spinach: { name: '菠菜', calories: 23 },
  lettuce: { name: '生菜', calories: 15 },
  tomato: { name: '番茄', calories: 18 },

  // 水果类
  apple: { name: '苹果', calories: 52 },
  banana: { name: '香蕉', calories: 89 },
  orange: { name: '橙子', calories: 47 },

  // 蛋奶类
  egg: { name: '鸡蛋', calories: 144 },
  milk: { name: '牛奶', calories: 65 },
  cheese: { name: '奶酪', calories: 350 },

  // 饮品类
  coffee: { name: '咖啡', calories: 1 },
  tea: { name: '茶', calories: 1 },
  cola: { name: '可乐', calories: 42 },

  // 中餐常见
  'mapo tofu': { name: '麻婆豆腐', calories: 130 },
  'kung pao chicken': { name: '宫保鸡丁', calories: 180 },
  'sweet sour pork': { name: '糖醋里脊', calories: 220 },
  'fried rice': { name: '炒饭', calories: 180 },
  'fried noodles': { name: '炒面', calories: 200 },
  'dumplings': { name: '饺子', calories: 250 },
  'buns': { name: '包子', calories: 200 },
  'porridge': { name: '粥', calories: 50 },
  'tofu': { name: '豆腐', calories: 80 },
  'vegetables': { name: '蔬菜', calories: 25 },

  // 快餐类
  burger: { name: '汉堡', calories: 295 },
  pizza: { name: '披萨', calories: 266 },
  fries: { name: '薯条', calories: 312 },
  'ice cream': { name: '冰淇淋', calories: 207 },

  // 默认
  unknown: { name: '未知食物', calories: 100 },
}

/**
 * 模拟食物识别（当前为 MOCK 实现）
 *
 * 未来替换方式：
 * 1. 接入 YOLO 模型（推荐使用 ONNX Runtime Web）
 * 2. 接入第三方食物识别 API
 * 3. 接入自定义训练的模型
 *
 * @param {string} imageDataUrl - 图片的 data URL
 * @returns {Promise<{ foods: Array, totalCalories: number }>}
 */
export async function recognizeFood(imageDataUrl) {
  // 模拟识别延迟
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 随机生成 2-5 种食物
  const foodCount = Math.floor(Math.random() * 4) + 2
  const allFoods = Object.keys(FOOD_CALORIE_TABLE)
  const selectedFoods = []
  const usedIndices = new Set()

  for (let i = 0; i < foodCount; i++) {
    let idx
    do {
      idx = Math.floor(Math.random() * allFoods.length)
    } while (usedIndices.has(idx) && usedIndices.size < allFoods.length)

    usedIndices.add(idx)
    const key = allFoods[idx]
    const food = FOOD_CALORIE_TABLE[key]

    // 随机份量 0.5-2 份
    const portion = Math.random() * 1.5 + 0.5

    selectedFoods.push({
      id: `food_${Date.now()}_${i}`,
      name: food.name,
      originalName: key,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 置信度
      estimatedCalories: Math.round(food.calories * portion),
      portion: portion.toFixed(1),
    })
  }

  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.estimatedCalories, 0)

  return {
    foods: selectedFoods,
    totalCalories,
    method: 'mock', // 标识识别方式，未来可替换
  }
}

/**
 * 根据食物名称估算热量（用于手动编辑）
 */
export function estimateCaloriesByName(name) {
  const normalized = name.toLowerCase().trim()

  // 精确匹配
  if (FOOD_CALORIE_TABLE[normalized]) {
    return FOOD_CALORIE_TABLE[normalized].calories
  }

  // 模糊匹配
  for (const [key, food] of Object.entries(FOOD_CALORIE_TABLE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return food.calories
    }
  }

  // 默认值
  return 100
}

/**
 * 获取食物名称建议列表（用于自动补全）
 */
export function getFoodSuggestions(query) {
  if (!query || query.length < 1) return []

  const normalized = query.toLowerCase()
  const suggestions = []

  for (const [key, food] of Object.entries(FOOD_CALORIE_TABLE)) {
    if (key.includes(normalized) || food.name.includes(normalized)) {
      suggestions.push({
        name: food.name,
        originalName: key,
        calories: food.calories,
      })
    }
  }

  return suggestions.slice(0, 8)
}
