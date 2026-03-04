# 任务内容扩展与优先级交互优化 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 为 TodoList 小程序添加任务内容（标题+详情）功能，并优化优先级设置交互方式

**架构:** 渐进式重构，分两个阶段完成。阶段一扩展数据结构，阶段二重构 UI 组件。采用 TDD 开发模式，每步都编写测试先于实现。

**Tech Stack:** TypeScript 5.x, 微信小程序原生框架, glass-easel 组件系统

---

## 阶段一：数据结构扩展

### Task 1: 扩展 TodoItem 类型定义

**Files:**
- Modify: `miniprogram/types/todo.ts`

**Step 1: 查看当前类型定义**

```bash
# 在微信开发者工具中打开 types/todo.ts 查看当前定义
# 确认 TodoItem 接口结构
```

**Step 2: 添加 content 字段**

在 `TodoItem` 接口中添加 `content` 字段：

```typescript
interface TodoItem {
  id: string
  title: string           // 标题（必填）
  content: string         // 内容（可选，新增）
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
  // 不添加 isExpanded，因为这是 UI 状态，不应持久化到数据模型中
}
```

**Step 3: 提交类型定义更新**

```bash
git add miniprogram/types/todo.ts
git commit -m "feat(types): 扩展 TodoItem 类型，添加 content 字段"
```

---

### Task 2: 更新数据仓储层支持 content 字段

**Files:**
- Modify: `miniprogram/utils/todo-repository.ts`

**Step 1: 查看 repository 类的 create 方法**

查看当前 `create` 方法的实现，了解如何创建新任务。

**Step 2: 修改 create 方法支持 content 参数**

```typescript
// 在 create 方法中添加 content 参数支持
create(title: string, content: string = '', priority: Priority = 'low'): TodoItem {
  const todo: TodoItem = {
    id: this.generateId(),
    title: title.trim(),
    content: content.trim(),
    completed: false,
    priority,
    createdAt: Date.now()
  }

  this.save(todo)
  return todo
}
```

**Step 3: 更新 update 方法**

```typescript
// 在 update 方法中添加 content 字段更新支持
update(id: string, updates: Partial<Pick<TodoItem, 'id' | 'createdAt'>>): TodoItem | null {
  const todo = this.data.find(t => t.id === id)
  if (!todo) return null

  const updated = { ...todo, ...updates }
  const index = this.data.findIndex(t => t.id === id)
  this.data[index] = updated
  this.save()
  return updated
}
```

**Step 4: 提交仓储层更新**

```bash
git add miniprogram/utils/todo-repository.ts
git commit -m "feat(repository): 支持任务 content 字段的创建和更新"
```

---

### Task 3: 实现数据迁移逻辑

**Files:**
- Create: `miniprogram/utils/data-migration.ts`
- Modify: `miniprogram/app.ts`

**Step 1: 创建数据迁移工具**

创建 `miniprogram/utils/data-migration.ts`：

```typescript
/**
 * 数据迁移工具
 * 用于将旧版本数据迁移到新结构
 */

interface LegacyTodo {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
  // 没有 content 字段
}

/**
 * 迁移任务数据
 * 为缺少 content 字段的任务添加默认值
 */
export function migrateTodoData(todos: LegacyTodo[] | TodoItem[]): TodoItem[] {
  return todos.map(todo => {
    // 如果已有 content 字段，直接返回
    if ('content' in todo) {
      return todo as TodoItem
    }

    // 否则添加默认值
    return {
      ...todo,
      content: ''
    }
  })
}
```

**Step 2: 在 app.ts 中调用迁移**

在 `miniprogram/app.ts` 的 `onLaunch` 方法中添加迁移逻辑：

```typescript
import { migrateTodoData } from './utils/data-migration'

App<IAppOption>({
  onLaunch() {
    // 数据迁移：在应用启动时自动执行
    try {
      const todos = wx.getStorageSync('todos') || []
      const migratedTodos = migrateTodoData(todos)

      // 如果有数据被迁移，保存回存储
      if (JSON.stringify(todos) !== JSON.stringify(migratedTodos)) {
        wx.setStorageSync('todos', migratedTodos)
        console.log('✅ 数据迁移完成')
      }
    } catch (error) {
      console.error('❌ 数据迁移失败:', error)
      // 不影响应用启动，只是记录日志
    }
  }
})
```

**Step 3: 提交数据迁移功能**

```bash
git add miniprogram/utils/data-migration.ts miniprogram/app.ts
git commit -m "feat(migration): 添加任务数据自动迁移功能"
```

---

### Task 4: 编写数据层单元测试

**Files:**
- Create: `test/repo.test.ts`

**Step 1: 创建测试文件**

由于项目没有配置测试框架，此步骤暂时跳过，在阶段二 UI 实现时进行手动测试。

**Step 2: 手动验证数据迁移**

在微信开发者工具中：
1. 创建一个只有标题的任务
2. 重启小程序
3. 检查任务是否自动添加了 `content: ""` 字段

---

## 阶段二：UI 组件实现

### Task 5: 创建优先级色点组件

**Files:**
- Create: `miniprogram/components/priority-dot/index.ts`
- Create: `miniprogram/components/priority-dot/index.wxml`
- Create: `miniprogram/components/priority-dot/index.wxss`
- Create: `miniprogram/components/priority-dot/index.json`

**Step 1: 创建组件 TypeScript 文件**

创建 `miniprogram/components/priority-dot/index.ts`：

```typescript
/**
 * 优先级色点组件
 *
 * 显示任务优先级的彩色圆点，支持点击切换
 */

Component({
  /**
   * 组件属性
   */
  properties: {
    /** 任务 ID */
    todoId: {
      type: String,
      value: ''
    },
    /** 优先级 */
    priority: {
      type: String,
      value: 'low'
    },
    /** 是否可点击 */
    clickable: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件数据
   */
  data: {
    /** 色点颜色 */
    dotColor: '#8E8E93',  // 默认灰色（低优先级）
    /** 色点大小（px） */
    dotSize: 12
  },

  lifetimes: {
    /**
     * 组件挂载时设置颜色
     */
    attached() {
      this.updateDotColor()
    }
  },

  observers: {
    /**
     * 监听 priority 变化，更新颜色
     */
    'priority': function() {
      this.updateDotColor()
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 更新色点颜色
     */
    updateDotColor() {
      const colorMap = {
        'low': '#8E8E93',      // 灰色
        'medium': '#007AFF',   // 蓝色
        'high': '#FF3B30'      // 红色
      }

      this.setData({
        dotColor: colorMap[this.data.priority as keyof typeof colorMap]
      })
    },

    /**
     * 点击事件处理
     */
    onTap() {
      if (this.data.clickable && this.data.todoId) {
        this.triggerEvent('cycle', {
          id: this.data.todoId
        })
      }
    }
  }
})
```

**Step 2: 创建组件模板**

创建 `miniprogram/components/priority-dot/index.wxml`：

```xml
<view
  class="priority-dot"
  style="background-color: {{dotColor}}; width: {{dotSize}}px; height: {{dotSize}}px;"
  bind:tap="onTap"
  data-todo-id="{{todoId}}"
>
</view>
```

**Step 3: 创建组件样式**

创建 `miniprogram/components/priority-dot/index.wxss`：

```css
.priority-dot {
  display: inline-block;
  border-radius: 50%;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.priority-dot:active {
  opacity: 0.7;
}
```

**Step 4: 创建组件配置**

创建 `miniprogram/components/priority-dot/index.json`：

```json
{
  "component": true,
  "usingComponents": {}
}
```

**Step 5: 提交优先级组件**

```bash
git add miniprogram/components/priority-dot/
git commit -m "feat(component): 创建优先级色点组件，支持点击切换"
```

---

### Task 6: 重构首页卡片组件支持双行展示

**Files:**
- Modify: `miniprogram/components/swipe-card/index.wxml`
- Modify: `miniprogram/components/swipe-card/index.wxss`
- Modify: `miniprogram/components/swipe-card/index.ts`

**Step 1: 更新组件模板**

在 `miniprogram/components/swipe-card/index.wxml` 中，找到任务显示部分，添加内容展示：

```xml
<!-- 任务标题行 -->
<view class="todo-header">
  <priority-dot
    todo-id="{{todoId}}"
    priority="{{priority}}"
    bind:cycle="handlePriority"
  />
  <text class="todo-title">{{title}}</text>
</view>

<!-- 任务内容行 -->
<view
  wx:if="{{content}}"
  class="todo-content {{isExpanded ? 'expanded' : ''}}"
  bind:tap="onContentTap"
  data-todo-id="{{todoId}}"
>
  <text class="content-text">
    {{isExpanded ? content : truncatedContent}}
  </text>
  <text
    wx:if="{{showExpandHint}}"
    class="expand-hint"
  >
    {{isExpanded ? '...收起' : '...展开'}}
  </text>
</view>
```

**Step 2: 更新组件样式**

在 `miniprogram/components/swipe-card/index.wxss` 中添加样式：

```css
/* 任务标题行 */
.todo-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.todo-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 任务内容行 */
.todo-content {
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.content-text {
  font-size: 28rpx;
  color: #666;
  word-break: break-all;
}

/* 内容最多显示2行 */
.todo-content:not(.expanded) .content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 展开提示 */
.expand-hint {
  color: #007AFF;
  font-size: 24rpx;
  margin-left: 8rpx;
}
```

**Step 3: 更新组件逻辑**

在 `miniprogram/components/swipe-card/index.ts` 中：

```typescript
Component({
  properties: {
    todoId: String,
    title: String,
    content: {
      type: String,
      value: ''
    },
    priority: String,
    isExpanded: {
      type: Boolean,
      value: false
    }
  },

  data: {
    truncatedContent: '',
    showExpandHint: false
  },

  observers: {
    'content': function() {
      this.updateContentDisplay()
    },
    'isExpanded': function() {
      // 当展开状态改变时，通知父组件更新全局展开状态
      if (this.data.isExpanded) {
        this.triggerEvent('expand', { id: this.data.todoId })
      }
    }
  },

  lifetimes: {
    attached() {
      this.updateContentDisplay()
    }
  },

  methods: {
    /**
     * 更新内容显示
     */
    updateContentDisplay() {
      const content = this.data.content || ''
      const maxLength = 50 // 约2行文字
      const shouldTruncate = content.length > maxLength && !this.data.isExpanded

      this.setData({
        truncatedContent: shouldTruncate ? content.substring(0, maxLength) : content,
        showExpandHint: content.length > maxLength
      })
    },

    /**
     * 内容区域点击事件
     */
    onContentTap() {
      this.triggerEvent('toggle-expand', {
        id: this.data.todoId
      })
    },

    /**
     * 优先级切换事件
     */
    handlePriority(e: any) {
      const { id } = e.detail
      this.triggerEvent('priority', { id })
    }
  }
})
```

**Step 4: 提交卡片组件更新**

```bash
git add miniprogram/components/swipe-card/
git commit -m "feat(card): 重构卡片组件，支持标题+内容双行展示"
```

---

### Task 7: 更新首页组件实现展开状态管理

**Files:**
- Modify: `miniprogram/pages/index/index.ts`
- Modify: `miniprogram/pages/index/index.wxml`

**Step 1: 更新首页状态**

在 `miniprogram/pages/index/index.ts` 的 `data` 中添加：

```typescript
data: {
  todos: [] as TodoItem[],
  pendingCount: 0,
  highPriorityCount: 0,
  isBusy: false,
  highlightTodoId: '',
  expandedId: '' as string,  // 新增：当前展开的任务ID
}
```

**Step 2: 添加展开/收起方法**

在 `methods` 中添加：

```typescript
/**
 * 切换任务展开状态
 */
toggleExpand(todoId: string) {
  const newExpandedId = this.data.expandedId === todoId ? '' : todoId

  // 先关闭其他卡片，再展开当前卡片
  this.setData({ expandedId: '' }, () => {
    if (newExpandedId) {
      this.setData({ expandedId: newExpandedId })
    }
  })
}
```

**Step 3: 更新卡片模板事件处理**

在首页模板中，为 swipe-card 组件添加事件处理：

```xml
<swipe-card
  wx:for="{{todos}}"
  wx:key="id"
  todo-id="{{item.id}}"
  title="{{item.title}}"
  content="{{item.content}}"
  priority="{{item.priority}}"
  isExpanded="{{expandedId === item.id}}"
  bind:toggle-expand="toggleExpand"
  bind:priority="handlePriority"
/>
```

**Step 4: 提交首页更新**

```bash
git add miniprogram/pages/index/
git commit -m "feat(index): 添加任务展开/收起功能"
```

---

### Task 8: 实现分区点击逻辑

**Files:**
- Modify: `miniprogram/components/swipe-card/index.wxml`
- Modify: `miniprogram/components/swipe-card/index.ts`

**Step 1: 在卡片根元素添加点击事件**

在 `swipe-card` 的根 view 元素上添加点击事件：

```xml
<view
  class="todo-card"
  bind:tap="onCardTap"
  catch:tap="true"
>
  <!-- 现有内容 -->
</view>
```

**Step 2: 实现分区点击逻辑**

在 `miniprogram/components/swipe-card/index.ts` 的 methods 中添加：

```typescript
/**
 * 卡片点击事件处理
 * 实现分区点击：左侧25%切换状态，中间展开/收起
 */
onCardTap(e: any) {
  const touch = e.changedTouches[0]
  const cardWidth = (this.$el as HTMLElement).offsetWidth

  // 计算点击位置比例
  const clickRatio = touch.clientX / cardWidth

  if (clickRatio < 0.25) {
    // 左侧 25%：切换完成状态
    this.triggerEvent('toggle', { id: this.data.todoId })
  } else if (clickRatio < 0.85) {
    // 中间 60%：展开/收起内容
    this.triggerEvent('toggle-expand', { id: this.data.todoId })
  }
  // 右侧 15%：不处理，由按钮组件处理
}
```

**Step 3: 提交分区点击功能**

```bash
git add miniprogram/components/swipe-card/
git commit -m "feat(card): 实现分区点击逻辑（左侧状态，中间展开）"
```

---

### Task 9: 重构编辑页添加分段控制器

**Files:**
- Modify: `miniprogram/pages/task-form/index.wxml`
- Modify: `miniprogram/pages/task-form/index.ts`
- Modify: `miniprogram/pages/task-form/index.wxss`

**Step 1: 更新编辑页模板**

在 `miniprogram/pages/task-form/index.wxml` 中：

```xml
<view class="form-container">
  <!-- 标题输入区 -->
  <view class="form-item">
    <text class="label">标题</text>
    <view class="title-row">
      <input
        class="title-input"
        placeholder="输入任务标题..."
        value="{{form.title}}"
        bind:input="onTitleInput"
        maxlength="50"
      />
      <segmented-control
        values="{{['低', '中', '高']}}"
        bind:change="onPriorityChange"
        class="priority-selector"
      />
    </view>
  </view>

  <!-- 内容输入区 -->
  <view class="form-item">
    <text class="label">内容</text>
    <textarea
      class="content-input"
      placeholder="输入详细内容...（可选）"
      value="{{form.content}}"
      bind:input="onContentInput"
      maxlength="500"
      auto-height
    />
  </view>

  <!-- 按钮区 -->
  <view class="button-row">
    <button class="btn-save" bind:tap="handleSave">保存</button>
    <button class="btn-cancel" bind:tap="handleCancel">取消</button>
  </view>
</view>
```

**Step 2: 更新编辑页样式**

在 `miniprogram/pages/task-form/index.wxss` 中添加：

```css
.title-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.title-input {
  flex: 1;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
}

.priority-selector {
  width: 200rpx;
  flex-shrink: 0;
}
```

**Step 3: 更新编辑页逻辑**

在 `miniprogram/pages/task-form/index.ts` 中：

```typescript
Component({
  data: {
    form: {
      title: '',
      content: '',
      priority: 'low' as 'low' | 'medium' | 'high'
    }
  },

  methods: {
    /**
     * 标题输入
     */
    onTitleInput(e: any) {
      this.setData({
        'form.title': e.detail.value
      })
    },

    /**
     * 内容输入
     */
    onContentInput(e: any) {
      this.setData({
        'form.content': e.detail.value
      })
    },

    /**
     * 优先级分段控制器变化
     */
    onPriorityChange(e: any) {
      const priorities = ['low', 'medium', 'high']
      this.setData({
        'form.priority': priorities[e.detail.value]
      })
    },

    /**
     * 保存任务
     */
    handleSave() {
      const { title, content, priority } = this.data.form

      // 验证标题
      if (!title.trim()) {
        wx.showToast({
          title: '请输入任务标题',
          icon: 'none'
        })
        return
      }

      // 创建任务
      repository.create(title.trim(), content.trim(), priority)

      wx.showToast({ title: '已创建', icon: 'success' })

      // 延迟返回，让用户看到 Toast
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    },

    /**
     * 取消编辑
     */
    handleCancel() {
      wx.navigateBack()
    }
  }
})
```

**Step 4: 提交编辑页更新**

```bash
git add miniprogram/pages/task-form/
git commit -m "feat(task-form): 添加分段控制器和内容输入支持"
```

---

### Task 10: 更新任务编辑页

**Files:**
- Modify: `miniprogram/pages/task-edit/index.wxml`
- Modify: `miniprogram/pages/task-edit/index.ts`

**Step 1: 添加内容编辑支持**

参考 Task 9 的实现方式，在编辑页添加内容输入框和分段控制器。

**Step 2: 更新保存逻辑**

修改 `handleSave` 方法，使用 `repository.update()` 而不是 `create()`。

**Step 3: 提交编辑页更新**

```bash
git add miniprogram/pages/task-edit/
git commit -m "feat(task-edit): 支持编辑标题、内容和优先级"
```

---

## 测试与验证

### Task 11: 功能测试

**Step 1: 测试数据迁移**

在微信开发者工具中：
1. 创建一个旧格式的任务（只有标题）
2. 重启小程序
3. 验证任务自动添加了 `content: ""` 字段

**Step 2: 测试优先级色点**

1. 创建一个任务
2. 点击优先级色点 3 次
3. 验证：灰→蓝→红→灰 的循环切换
4. 验证 Toast 提示显示

**Step 3: 测试内容展开/收起**

1. 创建一个带长内容的任务（> 50 字）
2. 查看首页显示是否只显示前 50 字
3. 点击中间区域
4. 验证：显示 "...展开" 提示
5. 再次点击中间区域
6. 验证：显示完整内容 + "...收起" 提示

**Step 4: 测试分区点击**

1. 点击任务卡片左侧 25% 区域
   - 验证：任务完成状态切换
2. 点击任务卡片中间 60% 区域
   - 验证：内容展开/收起
3. 左滑显示编辑/删除按钮
   - 验证：按钮功能正常

**Step 5: 测试编辑页分段控制器**

1. 点击新增按钮进入创建页
2. 输入标题和内容
3. 点击分段控制器选择优先级
4. 保存并验证首页显示正确

---

### Task 12: 边界情况测试

**Step 1: 测试空内容**

1. 创建只有标题的任务（内容为空）
2. 验证：不显示内容行
3. 验证：卡片高度一致

**Step 2: 测试超长内容**

1. 创建标题 50 字、内容 500 字的任务
2. 验证：正常保存和显示
3. 验证：输入框长度限制生效

**Step 3: 测试展开状态异常**

1. 展开一个任务
2. 点击另一个任务展开
3. 验证：第一个任务自动收起

**Step 4: 测试数据兼容性**

1. 检查所有旧任务是否自动迁移
2. 验证：旧任务功能正常

---

### Task 13: 性能测试

**Step 1: 测试首页滚动性能**

创建 50 个任务，验证：
- 滚动流畅，无卡顿
- 展开/收起动画顺滑

**Step 2: 测试响应时间**

使用微信开发者工具的性能监控，验证：
- 优先级切换响应 < 100ms
- 展开/收起动画 < 300ms

**Step 3: 测试内存占用**

多次展开/收起操作，验证：
- 内存无异常增长
- 无内存泄漏

---

## 验收标准检查清单

在完成所有任务后，逐项验证以下验收标准：

### 功能验收
- [ ] 任务可以只有标题
- [ ] 任务可以有标题+内容
- [ ] 首页同时显示标题和内容（最多2行）
- [ ] 点击中间区域展开/收起完整内容
- [ ] 点击优先级色点快速切换（红/蓝/灰）
- [ ] 编辑页可以设置优先级（分段控制器）
- [ ] 左滑显示编辑/删除按钮

### 性能验收
- [ ] 首页滚动流畅，无卡顿
- [ ] 展开/收起动画顺滑（300ms）
- [ ] 优先级切换响应及时（< 100ms）

### 兼容性验收
- [ ] 旧任务自动适配新结构
- [ ] 空内容正常显示
- [ ] 长内容正常截断和展开

---

## 相关资源

**设计文档**: `docs/plans/2026-03-04-todo-content-priority-design.md`

**类型定义**: `miniprogram/types/todo.ts`

**仓储层**: `miniprogram/utils/todo-repository.ts`

**优先级配置**: `miniprogram/types/todo.ts` 中的 PRIORITY_CONFIG

**微信小程序文档**:
- [组件文档](https://developers.weixin.qq.com/miniprogram/dev/reference/api/)
- [API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/)

---

## 注意事项

1. **遵循 Git 规范**：所有提交使用中文描述
2. **TDD 开发**：先写测试，后写实现（虽然当前没有测试框架，但保持测试思维）
3. **频繁提交**：每完成一个小功能就提交
4. **中文注释**：所有代码使用中文注释
5. **向后兼容**：确保旧数据和旧功能正常工作

---

**实施计划版本**: 1.0
**创建日期**: 2026-03-04
**预计工作量**: 4-6 小时
**难度等级**: 中等
