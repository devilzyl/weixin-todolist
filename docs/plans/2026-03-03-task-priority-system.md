# 任务优先级系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 为 TodoList 添加三级优先级管理系统，通过统一的左滑手势设置优先级、编辑和删除任务

**架构:** 扩展现有 TodoItem 数据模型，使用微信小程序 movable-area 实现滑动交互，保持数据向后兼容

**技术栈:** 微信小程序、TypeScript、WXSS、本地存储

---

## Task 0: 创建功能分支

**目的:** 隔离开发环境，保持主分支稳定

**Step 1: 创建新分支**

```bash
git checkout -b feature/task-priority-system
```

**Step 2: 验证分支**

```bash
git branch
```

Expected: 看到 `* feature/task-priority-system`

**Step 3: 查看设计文档**

```bash
cat docs/plans/2026-03-03-task-priority-system-design.md
```

**Step 4: 分支完成确认**

无提交，仅分支创建

---

## Task 1: 扩展 TodoItem 类型定义

**目的:** 添加 priority 字段到数据类型

**Files:**
- Modify: `miniprogram/types/todo.ts`

**Step 1: 读取当前类型定义**

当前 TodoItem 类型：
```typescript
export type TodoItem = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
}
```

**Step 2: 添加 priority 字段**

在 `TodoItem` 类型中添加：

```typescript
export type TodoItem = {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'  // 新增：优先级
  createdAt: number
  updatedAt: number
}
```

**Step 3: 添加优先级类型常量**

在同一文件末尾添加：

```typescript
/**
 * 任务优先级枚举
 */
export type TodoPriority = 'high' | 'medium' | 'low'

/**
 * 优先级配置
 */
export const PRIORITY_CONFIG = {
  high: { label: '高', icon: '🔴⭐⭐', color: '#FF4D4F', value: 'high' as TodoPriority },
  medium: { label: '中', icon: '🟡⭐', color: '#FFA500', value: 'medium' as TodoPriority },
  low: { label: '低', icon: '🟢', color: '#52C41A', value: 'low' as TodoPriority },
} as const

/**
 * 默认优先级
 */
export const DEFAULT_PRIORITY: TodoPriority = 'medium'
```

**Step 4: 验证类型定义**

在项目根目录运行（如果有类型检查）：
```bash
npm run type-check 2>/dev/null || echo "Type check skipped"
```

Expected: 无类型错误

**Step 5: 提交类型定义**

```bash
git add miniprogram/types/todo.ts
git commit -m "feat: 添加任务优先级类型定义

- 添加 priority 字段到 TodoItem
- 定义 TodoPriority 类型和优先级配置常量
- 设置默认优先级为 medium

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 更新仓储层 - 数据迁移

**目的:** 为旧数据添加默认优先级，实现向后兼容

**Files:**
- Modify: `miniprogram/utils/todo-repository.ts`

**Step 1: 读取仓储类**

找到 `LocalTodoRepository` 类的 `_validateAndHeal` 方法

**Step 2: 添加数据迁移逻辑**

在 `_validateAndHeal` 方法中添加优先级迁移：

```typescript
/**
 * 验证并自愈数据
 * @param data - 原始数据
 * @returns 验证后的数据
 */
private _validateAndHeal(data: unknown): TodoItem[] {
  // 现有的验证逻辑...

  // 新增：优先级迁移
  const migratedData = validatedData.map((item) => {
    if (!item.priority) {
      return { ...item, priority: DEFAULT_PRIORITY }
    }
    return item
  })

  return migratedData
}
```

**Step 3: 更新 create 方法**

修改 `create` 方法，添加默认优先级：

```typescript
/**
 * 创建新任务
 * @param input - 包含任务标题的输入对象
 * @returns 新创建的任务对象
 */
create(input: { title: string }): TodoItem {
  const now = Date.now()
  const newTodo: TodoItem = {
    id: this._generateId(),
    title: input.title,
    completed: false,
    priority: DEFAULT_PRIORITY,  // 新增：默认优先级
    createdAt: now,
    updatedAt: now,
  }

  const todos = this.list()
  todos.push(newTodo)

  this._saveToStorage(todos)

  return newTodo
}
```

**Step 4: 测试数据迁移**

在小程序开发工具中：
1. 清除本地存储
2. 创建一个新任务
3. 检查存储数据是否包含 `priority: "medium"`

Expected: 任务包含 priority 字段

**Step 5: 提交数据迁移**

```bash
git add miniprogram/utils/todo-repository.ts
git commit -m "feat: 实现优先级数据迁移和默认值

- 为旧任务自动添加默认优先级 medium
- create 方法设置新任务默认优先级
- 确保数据向后兼容

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 扩展仓储层 - 优先级操作方法

**目的:** 添加切换优先级的仓储方法

**Files:**
- Modify: `miniprogram/utils/todo-repository.ts`
- Modify: `miniprogram/types/todo.ts`

**Step 1: 添加接口方法定义**

在 `TodoRepository` 接口中添加：

```typescript
/**
 * 切换任务优先级
 * @param id - 任务 ID
 * @returns 更新后的任务，不存在时返回 null
 */
cyclePriority(id: string): TodoItem | null
```

**Step 2: 实现优先级切换**

在 `LocalTodoRepository` 类中添加：

```typescript
/**
 * 切换任务优先级
 * @param id - 任务 ID
 * @returns 更新后的任务，不存在时返回 null
 */
cyclePriority(id: string): TodoItem | null {
  const todos = this.list()
  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    return null
  }

  // 优先级循环：high -> medium -> low -> high
  const priorityOrder: TodoPriority[] = ['high', 'medium', 'low']
  const currentIndex = priorityOrder.indexOf(todo.priority)
  const nextIndex = (currentIndex + 1) % priorityOrder.length
  const nextPriority = priorityOrder[nextIndex]

  const updatedTodo: TodoItem = {
    ...todo,
    priority: nextPriority,
    updatedAt: Date.now(),
  }

  // 更新数组中的任务
  const index = todos.findIndex((t) => t.id === id)
  if (index !== -1) {
    todos[index] = updatedTodo
  }

  this._saveToStorage(todos)

  return updatedTodo
}
```

**Step 3: 提交优先级切换方法**

```bash
git add miniprogram/utils/todo-repository.ts miniprogram/types/todo.ts
git commit -m "feat: 添加优先级切换仓储方法

- 新增 cyclePriority 接口方法和实现
- 支持循环切换：high -> medium -> low -> high
- 自动更新 updatedAt 时间戳

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: 创建滑动操作组件

**目的:** 封装可复用的滑动卡片组件

**Files:**
- Create: `miniprogram/components/swipe-card/`
- Create: `miniprogram/components/swipe-card/index.wxml`
- Create: `miniprogram/components/swipe-card/index.wxss`
- Create: `miniprogram/components/swipe-card/index.ts`
- Create: `miniprogram/components/swipe-card/index.json`

**Step 1: 创建组件配置**

`miniprogram/components/swipe-card/index.json`:
```json
{
  "component": true,
  "usingComponents": {}
}
```

**Step 2: 创建组件模板**

`miniprogram/components/swipe-card/index.wxml`:
```xml
<!-- 滑动卡片组件 -->
<movable-area class="swipe-area">
  <movable-view
    class="swipe-content"
    direction="horizontal"
    x="{{translateX}}"
    damping="40"
    friction="10"
    bindchange="onMove"
    bindtouchend="onTouchEnd"
  >
    <!-- 卡片内容插槽 -->
    <slot></slot>
  </movable-view>

  <!-- 操作按钮区域 -->
  <view class="action-buttons">
    <view
      class="action-btn priority-btn"
      catchtap="onPriority"
      data-id="{{todoId}}"
    >
      <text class="action-text">优先级</text>
    </view>
    <view
      class="action-btn edit-btn"
      catchtap="onEdit"
      data-id="{{todoId}}"
      data-title="{{title}}"
    >
      <text class="action-text">编辑</text>
    </view>
    <view
      class="action-btn delete-btn"
      catchtap="onDelete"
      data-id="{{todoId}}"
    >
      <text class="action-text">删除</text>
    </view>
  </view>
</movable-area>
```

**Step 3: 创建组件样式**

`miniprogram/components/swipe-card/index.wxss`:
```css
/**
 * 滑动卡片组件样式
 */

.swipe-area {
  position: relative;
  width: 100%;
  height: 100%;
}

.swipe-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  background-color: #FFFFFF;
}

.action-buttons {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  z-index: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.priority-btn {
  background-color: #4A90E2;
  color: #FFFFFF;
}

.edit-btn {
  background-color: #FFA500;
  color: #FFFFFF;
}

.delete-btn {
  background-color: #FF4D4F;
  color: #FFFFFF;
}
```

**Step 4: 创建组件逻辑**

`miniprogram/components/swipe-card/index.ts`:
```typescript
/**
 * 滑动卡片组件
 *
 * 支持左滑显示操作按钮
 * 提供优先级切换、编辑、删除功能
 */

Component({
  /** 组件属性 */
  properties: {
    /** 任务 ID */
    todoId: {
      type: String,
      required: true,
    },
    /** 任务标题 */
    title: {
      type: String,
      value: '',
    },
  },

  /** 组件数据 */
  data: {
    /** 滑动偏移量 */
    translateX: 0,
    /** 按钮总宽度 */
    buttonWidth: 360,  // 3个按钮 * 120rpx
  },

  /** 组件方法 */
  methods: {
    /**
     * 滑动移动事件
     */
    onMove(e: any) {
      const x = e.detail.x
      // 限制只能向左滑动
      if (x > 0) return

      // 限制最大滑动距离
      const maxTranslate = -this.data.buttonWidth
      if (x < maxTranslate) return

      this.setData({ translateX: x })
    },

    /**
     * 触摸结束事件
     */
    onTouchEnd() {
      const { translateX, buttonWidth } = this.data

      // 滑动超过一半，自动展开；否则复位
      if (translateX < -buttonWidth / 2) {
        this.setData({ translateX: -buttonWidth })
      } else {
        this.setData({ translateX: 0 })
      }
    },

    /**
     * 优先级按钮点击
     */
    onPriority(e: any) {
      this.resetPosition()
      this.triggerEvent('priority', { id: e.currentTarget.dataset.id })
    },

    /**
     * 编辑按钮点击
     */
    onEdit(e: any) {
      this.resetPosition()
      this.triggerEvent('edit', {
        id: e.currentTarget.dataset.id,
        title: e.currentTarget.dataset.title
      })
    },

    /**
     * 删除按钮点击
     */
    onDelete(e: any) {
      this.resetPosition()
      this.triggerEvent('delete', { id: e.currentTarget.dataset.id })
    },

    /**
     * 重置滑动位置
     */
    resetPosition() {
      this.setData({ translateX: 0 })
    },
  },
})
```

**Step 5: 提交组件创建**

```bash
git add miniprogram/components/swipe-card/
git commit -m "feat: 创建滑动操作卡片组件

- 实现左滑显示操作按钮
- 支持优先级、编辑、删除三种操作
- 提供事件接口供父组件调用
- 自动复位和展开动画

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 更新首页 - 引入组件和计算优先级统计

**目的:** 更新首页逻辑，集成优先级功能

**Files:**
- Modify: `miniprogram/pages/index/index.ts`
- Modify: `miniprogram/pages/index/index.json`

**Step 1: 引入组件配置**

`miniprogram/pages/index/index.json`:
```json
{
  "navigationBarTitleText": "待办事项",
  "usingComponents": {
    "swipe-card": "/components/swipe-card/index"
  }
}
```

**Step 2: 更新首页逻辑**

在 `miniprogram/pages/index/index.ts` 中：

添加导入：
```typescript
import { LocalTodoRepository } from '../../utils/todo-repository'
import { PRIORITY_CONFIG, DEFAULT_PRIORITY } from '../../types/todo'
import type { TodoItem } from '../../types/todo'
```

更新 data：
```typescript
data: {
  todos: [] as TodoItem[],
  pendingCount: 0,
  highPriorityCount: 0,  // 新增：高优先级任务数
  isBusy: false,
  highlightTodoId: '',
},
```

更新 `reloadTodos` 方法：
```typescript
reloadTodos() {
  const todos = repository.list()
  const validTodos = Array.isArray(todos) ? todos : []

  // 计算待完成任务数
  const pendingCount = validTodos.filter(
    (t) => t && typeof t.completed === 'boolean' && !t.completed
  ).length

  // 计算高优先级任务数
  const highPriorityCount = validTodos.filter(
    (t) => t && !t.completed && t.priority === 'high'
  ).length

  this.setData({
    todos: validTodos,
    pendingCount,
    highPriorityCount,
  })
},
```

添加优先级处理方法：
```typescript
/**
 * 切换任务优先级
 * @param e - 事件对象
 */
handlePriority(e: any) {
  if (this.data.isBusy) return

  const { id } = e.detail
  if (!id) return

  this.setData({ isBusy: true })

  const result = repository.cyclePriority(id)
  if (result) {
    // 显示提示
    const priorityLabel = PRIORITY_CONFIG[result.priority].label
    wx.showToast({
      title: `优先级：${priorityLabel}`,
      icon: 'none',
      duration: 1000,
    })
  }

  this.reloadTodos()

  setTimeout(() => {
    this.setData({ isBusy: false })
  }, 300)
},
```

**Step 3: 提交逻辑更新**

```bash
git add miniprogram/pages/index/index.ts miniprogram/pages/index/index.json
git commit -m "feat: 首页集成优先级统计和切换功能

- 引入滑动卡片组件
- 添加 highPriorityCount 统计
- 实现 handlePriority 方法
- 显示优先级切换提示

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 更新首页模板 - 优先级图标和滑动卡片

**目的:** 更新首页UI，显示优先级并使用滑动卡片

**Files:**
- Modify: `miniprogram/pages/index/index.wxml`

**Step 1: 更新今日关注卡片**

找到 `<view class="focus-card">`，更新内容：

```xml
<!-- 今日关注区域 -->
<view class="focus-card" wx:if="{{todos.length > 0}}">
  <text class="focus-subtitle">今日关注</text>
  <text class="focus-desc">
    您有 {{pendingCount}} 个待办任务
    <text wx:if="{{highPriorityCount > 0}}" class="high-priority">
      （{{highPriorityCount}} 个高优先级）
    </text>
  </text>
</view>
```

**Step 2: 更新任务卡片为滑动组件**

找到任务卡片 `<view class="task-card">` 部分，替换为：

```xml
<!-- 任务卡片 -->
<swipe-card
  wx:for="{{todos}}"
  wx:key="id"
  class="task-card {{item.completed ? 'completed' : ''}}"
  todo-id="{{item.id}}"
  title="{{item.title}}"
  bind:priority="handlePriority"
  bind:edit="navigateToEdit"
  bind:delete="handleDelete"
>
  <!-- 任务配图占位符（点击切换状态） -->
  <view class="task-image" bindtap="handleToggle" data-id="{{item.id}}">
    <text class="task-icon">{{item.completed ? '✓' : '○'}}</text>
  </view>

  <!-- 任务内容 -->
  <view class="task-content" bindtap="handleToggle" data-id="{{item.id}}">
    <text class="task-title">{{item.title}}</text>
  </view>

  <!-- 优先级图标（新增） -->
  <view class="priority-badge">
    <text class="priority-icon">{{item.priority === 'high' ? '🔴⭐⭐' : item.priority === 'medium' ? '🟡⭐' : '🟢'}}</text>
  </view>
</swipe-card>
```

**Step 3: 移除原有操作按钮**

删除原有的 `task-actions` 部分（编辑和删除按钮）

**Step 4: 提交模板更新**

```bash
git add miniprogram/pages/index/index.wxml
git commit -m "feat: 首页UI更新为滑动卡片和优先级显示

- 今日关注显示高优先级任务数
- 任务卡片使用滑动组件
- 移除固定操作按钮
- 添加优先级图标显示

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 更新首页样式 - 优先级和滑动效果

**目的:** 添加优先级图标和滑动卡片的样式

**Files:**
- Modify: `miniprogram/pages/index/index.wxss`

**Step 1: 添加高优先级文本样式**

在 `.focus-desc` 样式后添加：

```css
.high-priority {
  color: #FF4D4F;
  font-weight: 600;
}
```

**Step 2: 添加优先级图标样式**

在 `.task-actions` 样式前添加：

```css
/* 优先级图标 */
.priority-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 4rpx 8rpx;
  background-color: #F5F7FA;
  border-radius: 8rpx;
}

.priority-icon {
  font-size: 24rpx;
  line-height: 1;
}
```

**Step 3: 调整任务卡片布局**

修改 `.task-card` 样式，为滑动预留空间：

```css
.task-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  gap: 16rpx;
  transition: all 0.2s ease;
  overflow: hidden;
}
```

**Step 4: 提交样式更新**

```bash
git add miniprogram/pages/index/index.wxss
git commit -m "feat: 添加优先级图标和滑动卡片样式

- 高优先级文本使用红色高亮
- 优先级图标使用绝对定位
- 调整任务卡片布局适应滑动
- 优化视觉层次

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8: 修复编辑导航参数传递

**目的:** 确保编辑功能正常工作

**Files:**
- None (已在 Task 6 完成)

**Step 1: 测试编辑功能**

在小程序开发工具中：
1. 创建一个新任务
2. 左滑任务卡片
3. 点击"编辑"按钮
4. 检查是否正确跳转到编辑页

Expected: 正确跳转，标题显示正常

**Step 2: 如果有问题，检查 navigateToEdit 方法**

确认 `navigateToEdit` 方法正确获取参数：
```typescript
navigateToEdit(e: any) {
  const { id, title } = e.detail  // 注意：从 e.detail 获取
  // ... 其他逻辑
}
```

**Step 3: 如有修改则提交**

```bash
git add miniprogram/pages/index/index.ts
git commit -m "fix: 修复编辑参数传递

- 适配滑动组件的事件结构
- 从 e.detail 获取参数

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9: 测试数据迁移

**目的:** 验证旧数据升级正常

**Step 1: 创建测试数据**

在小程序开发工具控制台：
```javascript
// 插入旧格式数据（无 priority 字段）
wx.setStorageSync('todos:v1', [
  {
    id: 'test-1',
    title: '旧任务1',
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
])
```

**Step 2: 重启小程序**

在开发工具中点击"编译"

**Step 3: 验证数据迁移**

在控制台：
```javascript
const todos = wx.getStorageSync('todos:v1')
console.log(todos[0].priority)  // 应该输出 "medium"
```

Expected: 旧任务自动添加 `priority: "medium"`

**Step 4: 提交测试**

无需提交，仅验证

---

## Task 10: 完整功能测试

**目的:** 端到端测试所有功能

**Step 1: 测试优先级切换**

1. 创建一个新任务
2. 左滑任务卡片，点击"优先级"
3. 验证优先级变化：中 → 高 → 低 → 中

Expected: 优先级正确循环切换

**Step 2: 测试编辑功能**

1. 左滑任务卡片，点击"编辑"
2. 修改任务标题
3. 保存返回

Expected: 编辑成功，标题更新

**Step 3: 测试删除功能**

1. 左滑任务卡片，点击"删除"
2. 确认删除

Expected: 删除成功，任务从列表消失

**Step 4: 测试统计功能**

1. 创建三个任务，分别设置为高、中、低优先级
2. 查看"今日关注"卡片

Expected: 显示"1 个高优先级"

**Step 5: 测试滑动复位**

1. 左滑任务卡片（不松手）
2. 松手

Expected: 滑动距离超过一半自动展开，否则自动复位

**Step 6: 记录测试结果**

如有问题，记录并修复

---

## Task 11: 性能优化和边界处理

**目的:** 优化性能，处理边界情况

**Files:**
- Modify: `miniprogram/components/swipe-card/index.ts`
- Modify: `miniprogram/pages/index/index.ts`

**Step 1: 添加滑动复位逻辑**

在首页组件的 `onShow` 生命周期中复位所有滑动：

```typescript
pageLifetimes: {
  show() {
    this.reloadTodos()
    // 重置所有滑动卡片
    const swipeCards = this.selectAllComponents('.swipe-card')
    swipeCards.forEach(card => {
      card.resetPosition && card.resetPosition()
    })
  },
},
```

**Step 2: 添加操作锁**

确保滑动和点击不会冲突：

```typescript
// 在滑动卡片组件中
data: {
  translateX: 0,
  buttonWidth: 360,
  isSwiping: false,  // 新增
},

onMove(e: any) {
  this.setData({ isSwiping: true })
  // ... 现有逻辑
},

onTouchEnd() {
  this.setData({ isSwiping: false })
  // ... 现有逻辑
},
```

**Step 3: 提交优化**

```bash
git add miniprogram/components/swipe-card/index.ts miniprogram/pages/index/index.ts
git commit -m "perf: 优化滑动组件性能和边界处理

- 页面切换时自动复位滑动卡片
- 添加滑动状态标记
- 防止滑动和点击冲突

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 12: 代码审查和清理

**目的:** 代码审查，清理调试代码

**Step 1: 移除调试日志**

检查所有文件，移除 `console.log`、`console.error`（保留错误处理中的）

**Step 2: 检查代码注释**

确保所有新增代码有中文注释

**Step 3: 格式化代码**

```bash
# 如果有 Prettier
npm run format 2>/dev/null || echo "Format skipped"
```

**Step 4: 提交清理**

```bash
git add -A
git commit -m "refactor: 代码清理和优化

- 移除调试日志
- 完善代码注释
- 格式化代码

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 13: 合并到主分支

**目的:** 将功能分支合并到主分支

**Step 1: 切换到主分支**

```bash
git checkout main
```

**Step 2: 拉取最新代码**

```bash
git pull origin main
```

**Step 3: 合并功能分支**

```bash
git merge feature/task-priority-system --no-ff
```

**Step 4: 推送到远程**

```bash
git push origin main
```

**Step 5: 删除功能分支**

```bash
git branch -d feature/task-priority-system
```

---

## 测试清单

完成所有任务后，使用此清单验证：

### 功能测试
- [ ] 新任务默认为中优先级
- [ ] 左滑显示三个操作按钮
- [ ] 点击"优先级"循环切换
- [ ] 点击"编辑"正常跳转
- [ ] 点击"删除"需要确认
- [ ] 点击卡片切换完成状态
- [ ] "今日关注"显示高优先级数量

### 兼容性测试
- [ ] 旧任务自动升级为 medium
- [ ] 数据迁移不丢失
- [ ] iOS 微信正常
- [ ] Android 微信正常

### 性能测试
- [ ] 滑动流畅无卡顿
- [ ] 长列表（50+任务）滑动正常
- [ ] 快速连续操作响应正常

---

**计划版本:** 1.0
**创建日期:** 2026-03-03
**预计工时:** 2-3 小时
