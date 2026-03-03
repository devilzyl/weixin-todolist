# 任务优先级系统 - 设计文档

**创建日期**: 2026-03-03
**状态**: 设计阶段
**作者**: Claude Sonnet 4.6

---

## 1. 功能概述

为 TodoList 小程序添加任务优先级管理功能，帮助用户聚焦重要任务。

### 核心功能
- ✅ 三级优先级系统（高/中/低）
- ✅ 优先级图标展示
- ✅ 统一的左滑交互（设置优先级/编辑/删除）
- ✅ "今日关注"卡片增强（显示高优先级任务数）

---

## 2. 数据模型

### 2.1 TodoItem 类型扩展

```typescript
type TodoItem = {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'  // 新增字段
  createdAt: number
  updatedAt: number
}
```

### 2.2 优先级定义

| 级别 | 值 | 图标 | 说明 |
|------|-----|------|------|
| 高优先级 | `high` | 🔴⭐⭐ | 重要紧急 |
| 中优先级 | `medium` | 🟡⭐ | 普通（默认） |
| 低优先级 | `low` | 🟢 | 不急 |

### 2.3 数据迁移

现有任务自动添加 `priority: 'medium'` 作为默认值。

---

## 3. 交互设计

### 3.1 左滑操作

左滑任务卡片后显示三个操作按钮：

```
┌──────────────────────────────────────┐
│  🔴⭐⭐  完成任务示例              ← │ ← 左滑卡片
├──────────────────────────────────────┤
│  [设置优先级] [编辑] [删除]          │ ← 操作区
└──────────────────────────────────────┘
```

**操作按钮布局：**
- 宽度：每个按钮 120rpx
- 高度：与卡片一致
- 颜色：
  - 设置优先级：#4A90E2（蓝色）
  - 编辑：#FFA500（橙色）
  - 删除：#FF4D4F（红色）

### 3.2 操作行为

| 操作 | 行为 |
|------|------|
| 点击卡片 | 切换完成状态 |
| 左滑 → 设置优先级 | 循环切换：高 → 中 → 低 → 高 |
| 左滑 → 编辑 | 跳转到编辑页面 |
| 左滑 → 删除 | 弹出确认对话框，确认后删除 |

### 3.3 手势冲突处理

- **点击切换**和**左滑操作**互斥
- 左滑时禁用点击切换
- 松手后自动复位（未点击操作按钮时）

---

## 4. 界面设计

### 4.1 首页变化

**任务卡片：**
```xml
<view class="task-card" wx:for="{{todos}}" wx:key="id">
  <!-- 任务图标区域（优先级 + 完成状态） -->
  <view class="task-icon">
    <text class="priority-icon">{{priorityIcon}}</text>
    <text class="check-icon">{{completed ? '✓' : '○'}}</text>
  </view>

  <!-- 任务内容 -->
  <view class="task-content">
    <text class="task-title">{{title}}</text>
  </view>

  <!-- 左滑操作按钮 -->
  <view class="swipe-actions">
    <view class="action-priority">优先级</view>
    <view class="action-edit">编辑</view>
    <view class="action-delete">删除</view>
  </view>
</view>
```

**今日关注卡片：**
```xml
<view class="focus-card" wx:if="{{todos.length > 0}}">
  <text class="focus-subtitle">今日关注</text>
  <text class="focus-desc">
    您有 {{pendingCount}} 个待办任务
    <text wx:if="{{highPriorityCount > 0}}">
      （{{highPriorityCount}} 个高优先级）
    </text>
  </text>
</view>
```

### 4.2 新增/编辑页

**无需修改** - 保持极简，所有任务默认为"中优先级"，用户通过左滑调整。

---

## 5. 视觉设计

### 5.1 优先级图标样式

| 优先级 | 图标 | 颜色 | 字体大小 |
|--------|------|------|----------|
| 高 | 🔴⭐⭐ | 红色 + 金色 | 32rpx |
| 中 | 🟡⭐ | 金色 | 32rpx |
| 低 | 🟢 | 绿色 | 32rpx |

### 5.2 滑动操作按钮

```css
.swipe-actions {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
}

.action-priority {
  background-color: #4A90E2;
  color: #FFFFFF;
}

.action-edit {
  background-color: #FFA500;
  color: #FFFFFF;
}

.action-delete {
  background-color: #FF4D4F;
  color: #FFFFFF;
}
```

---

## 6. 技术实现要点

### 6.1 滑动组件方案

**推荐方案：使用微信小程序 movable-area**

```xml
<movable-area class="swipe-area">
  <movable-view
    class="swipe-item"
    direction="horizontal"
    x="{{item.translateX}}"
    bindchange="onSwipeChange"
    bindtouchend="onSwipeEnd"
  >
    <!-- 任务卡片内容 -->
  </movable-view>

  <!-- 操作按钮 -->
  <view class="action-buttons">
    <view bindtap="onSetPriority">优先级</view>
    <view bindtap="onEdit">编辑</view>
    <view bindtap="onDelete">删除</view>
  </view>
</movable-area>
```

**备选方案：使用第三方组件库**
- vant-weapp 的 SwipeCell 组件
- 直接封装成熟的滑动组件

### 6.2 排序逻辑

```typescript
// 保持现有排序规则
function sortTodos(todos: TodoItem[]): TodoItem[] {
  return todos.sort((a, b) => {
    // 1. 未完成在前
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 2. 按创建时间倒序
    return b.createdAt - a.createdAt
  })
}
```

### 6.3 数据兼容性

```typescript
// 数据迁移：为旧任务添加默认优先级
function migrateTodo(todo: TodoItem): TodoItem {
  if (!todo.priority) {
    return { ...todo, priority: 'medium' }
  }
  return todo
}
```

---

## 7. 状态管理

### 7.1 首页数据

```typescript
data: {
  todos: [] as TodoItem[],
  pendingCount: 0,
  highPriorityCount: 0,  // 新增：高优先级任务数
  isBusy: false,
}
```

### 7.2 任务卡片状态

```typescript
// 任务卡片额外状态
{
  translateX: 0,  // 滑动偏移量
  isSwiped: false,  // 是否已滑动
}
```

---

## 8. 边界情况处理

### 8.1 异常情况

| 情况 | 处理方式 |
|------|----------|
| 旧任务没有 priority 字段 | 自动设置为 'medium' |
| 滑动距离不足 | 自动复位 |
| 快速连续点击 | 使用操作锁防止 |
| 删除最后一个任务 | 正常删除，显示空态 |

### 8.2 用户体验

- **平滑动画**：滑动和复位使用 300ms 过渡
- **触觉反馈**：可选项（使用 wx.vibrateShort）
- **操作确认**：删除操作需要二次确认
- **自动保存**：优先级修改立即持久化

---

## 9. 性能考虑

### 9.1 优化策略

- **事件委托**：列表使用事件委托减少监听器数量
- **防抖节流**：滑动事件使用节流（16ms 一帧）
- **按需渲染**：滑动时只渲染可见卡片

### 9.2 数据存储

- 本地存储结构保持不变
- 优先级数据作为 TodoItem 的一部分
- 存储键名：`todos:v1`（向后兼容）

---

## 10. 测试要点

### 10.1 功能测试

- [ ] 创建新任务，默认为中优先级
- [ ] 左滑切换优先级：高 → 中 → 低 → 高
- [ ] 点击卡片切换完成状态
- [ ] 左滑编辑跳转正确
- [ ] 左滑删除需要确认
- [ ] "今日关注"正确显示高优先级数量

### 10.2 兼容性测试

- [ ] iOS 微信
- [ ] Android 微信
- [ ] 不同屏幕尺寸
- [ ] 数据迁移（旧任务升级）

### 10.3 边界测试

- [ ] 空任务列表
- [ ] 只有一个任务
- [ ] 快速连续滑动
- [ ] 同时滑动多个任务

---

## 11. 未来扩展

### 11.1 可能的后续功能

- 优先级筛选（只看高优先级任务）
- 优先级排序（高优先级置顶）
- 自定义优先级颜色
- 优先级统计（各优先级任务数量）

### 11.2 架构扩展性

当前设计预留扩展空间：
- priority 类型可扩展为自定义级别
- 操作按钮可动态配置
- 排序逻辑可插拔

---

## 12. 总结

本设计方案在保持极简风格的同时，通过统一的左滑交互提供了完整的优先级管理功能。核心特点：

✅ **极简**：不增加表单页面，保持原有流程
✅ **直观**：图标 + 颜色，一目了然
✅ **流畅**：手势操作，符合现代交互习惯
✅ **兼容**：向后兼容，数据平滑迁移

---

**文档版本**: 1.0
**最后更新**: 2026-03-03
