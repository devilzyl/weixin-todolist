# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **⚠️ 重要规范（必须遵守）**
>
> ### 📝 代码注释规范
> **所有后续代码必须使用中文注释**，包括：
> - 文件头部注释
> - 类和方法注释
> - 关键逻辑注释
> - JSDoc 参数说明
>
> ### 🔖 Git 提交规范
> **所有 Git 提交必须使用中文**，特别是 `feat` 类型：
> - ✅ 正确: `feat: 添加任务列表功能`
> - ❌ 错误: `feat: Add task list feature`
>
> ### 🔄 Git 版本控制规范
> **所有代码改动必须使用 Git 进行版本控制**，方便回溯和代码审查：
>
> **在修改代码前**：
> - ✅ 必须先创建 Git 分支：`git checkout -b feature/功能名称`
> - ✅ 明确修改目标和范围
> - ✅ 确保当前工作区干净（无未提交的改动）
>
> **在修改代码后**：
> - ✅ 必须提交改动：`git add . && git commit -m "类型: 描述改动"`
> - ✅ 提交信息必须清晰说明改动内容
> - ✅ 重大改动需要创建 Pull Request 进行代码审查
>
> **提交信息格式**：
> - `feat:` - 新功能
> - `fix:` - Bug 修复
> - `refactor:` - 代码重构（不改变功能）
> - `style:` - 代码格式调整（不影响逻辑）
> - `docs:` - 文档更新
> - `test:` - 测试相关
> - `chore:` - 构建/工具链相关
>
> **示例**：
> ```bash
> # 创建分支
> git checkout -b feature/添加优先级功能
>
> # 修改代码后提交
> git add .
> git commit -m "feat: 添加任务优先级设置功能"
>
> # 合并到主分支
> git checkout main
> git merge feature/添加优先级功能
> ```
>
> **这是强制性规范，不可违反！**

---

## Project Overview

这是一个**微信小程序 TodoList** 项目，使用 TypeScript 和 glass-easel 组件框架开发。

**AppID:** wx1dc949ebb148e062

## Development Environment

**重要提示:** 此项目必须使用**微信开发者工具**进行开发，而不是传统的 Node.js 构建系统。

1. 在微信开发者工具中打开项目
2. 设置项目根目录为: `E:\小程序\todulist`
3. TypeScript 编译由 IDE 的 TypeScript 插件自动处理
4. 使用内置模拟器进行测试

**无 npm 脚本用于构建** - 构建、编译由微信开发者工具处理。

### Testing

项目使用 minium 自动化测试框架：

```bash
# 运行测试
npm test

# 生成测试报告
npm run test:report
```

## Project Structure

```
todulist/
├── miniprogram/          # 小程序源代码根目录 (miniprogramRoot)
│   ├── app.ts           # 应用入口点 & 生命周期
│   ├── app.json         # 应用配置: 页面、路由、窗口设置
│   ├── app.wxss         # 全局样式
│   ├── pages/           # 页面组件
│   │   ├── index/       # 任务列表页
│   │   ├── task-form/   # 新增任务页
│   │   └── task-edit/   # 编辑任务页
│   ├── components/      # 可复用组件
│   │   ├── priority-dot/    # 优先级指示器
│   │   ├── control-bar/     # 筛选排序控制栏
│   │   └── swipe-card/      # 滑动卡片
│   ├── utils/           # 工具模块
│   │   ├── todo-repository.ts    # Todo 数据仓储
│   │   ├── data-migration.ts     # 数据迁移工具
│   │   └── util.ts              # 通用工具函数
│   └── types/           # TypeScript 类型定义
│       └── todo.ts      # Todo 核心类型
├── typings/             # TypeScript 类型定义
├── tsconfig.json        # TypeScript 配置
├── project.config.json  # 微信项目配置
└── project.private.config.json  # 本地设置（不提交）
```

## Architecture & Patterns

### Component-Based Pages

所有页面使用 `Component()` 构造器，而不是传统的 `Page()` 构造器：

```typescript
Component({
  data: {
    // 响应式状态
  },
  lifetimes: {
    attached() {
      // 组件初始化
    }
  },
  methods: {
    // 事件处理器和业务逻辑
  }
})
```

### Application Lifecycle

`app.ts` 使用 `App<IAppOption>()` 模式：

```typescript
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 应用初始化
  }
})
```

### State Management

- 状态存储在 `data` 对象中
- 使用 `this.setData()` 进行响应式更新
- 支持嵌套路径: `"userInfo.avatarUrl"`

```typescript
this.setData({
  "userInfo.avatarUrl": avatarUrl,
  hasUserInfo: true
})
```

### Navigation

```typescript
wx.navigateTo({
  url: '../logs/logs',
})
```

### Storage

使用微信本地存储 API：

```typescript
const todos = wx.getStorageSync('todos') || []
wx.setStorageSync('todos', todos)
```

### Repository Pattern（仓储模式）

项目使用仓储模式隔离数据访问层，便于未来迁移到云开发：

**核心接口:** `TodoRepository` (定义在 `types/todo.ts`)
**当前实现:** `LocalTodoRepository` (实现基于微信本地存储)

```typescript
// 使用示例
import { LocalTodoRepository } from '../../utils/todo-repository'

const repository = new LocalTodoRepository()

// CRUD 操作
const todos = repository.list()
const newTodo = repository.create({ title: '新任务' })
repository.toggle(todoId)
repository.remove(todoId)
```

**设计优势:**
- 接口与实现分离，易于替换存储方案
- 内置数据校验和自愈机制
- 统一的数据操作入口

**存储键名:** `todos:v1` (支持未来数据迁移)

### Component Communication

子组件通过 `triggerEvent` 向父组件发送事件：

```typescript
// 子组件中
this.triggerEvent('toggle', { id: this.data.todo.id })
```

```wxml
<!-- 父组件中 -->
<swipe-card bind:toggle="handleToggle" />
```

**事件命名规范:** 使用动词形式（toggle, delete, change）

### Page/Component Files

每个页面需要 4 个文件：
- `.ts` - 页面逻辑（基于 Component）
- `.wxml` - 模板（类似 HTML，使用 WXML 语法）
- `.wxss` - 样式（类似 CSS，使用 `rpx` 单位）
- `.json` - 页面配置

### WXML Template Syntax

- 数据绑定: `{{todo.text}}`
- 条件渲染: `wx:if`, `wx:elif`, `wx:else`
- 列表渲染: `wx:for`, `wx:key`
- 事件绑定: `bind:tap="onTap"`

## TypeScript Configuration

**已启用严格模式:**
- `strictNullChecks`, `noImplicitAny`, `strictPropertyInitialization`
- `noUnusedLocals`, `noUnusedParameters`
- Target: ES2020
- Modules: CommonJS

## Key Conventions

- **文件命名:** kebab-case (`index.ts`, `todo.wxml`)
- **注释语言:** 中文（代码注释使用中文）
- **样式:** 使用 `rpx` 单位进行响应式设计
- **安全区域:** 使用 `env(safe-area-inset-bottom)` 支持刘海屏

## Technology Stack

- **语言:** TypeScript (严格模式)
- **框架:** 微信小程序原生框架
- **组件框架:** glass-easel
- **构建系统:** 微信开发者工具（TypeScript 插件）
- **类型定义:** miniprogram-api-typings

## Common Patterns

### 操作锁模式

防止用户快速连点导致的状态混乱：

```typescript
Component({
  data: {
    isBusy: false,
  },
  methods: {
    handleAction() {
      if (this.data.isBusy) return

      this.setData({ isBusy: true })

      // 执行操作...

      setTimeout(() => {
        this.setData({ isBusy: false })
      }, 300)
    }
  }
})
```

### 用户偏好持久化

使用 `wx.setStorageSync` 保存筛选/排序偏好：

```typescript
// 保存
wx.setStorageSync('filterPriority', 'high')

// 读取（带默认值）
const filter = wx.getStorageSync('filterPriority') || 'all'
```

## Adding New Components

1. 在 `miniprogram/components/` 中创建目录
2. 创建 4 个文件: `.ts`, `.wxml`, `.wxss`, `.json`
3. 在 `.json` 中声明为自定义组件:
   ```json
   {
     "component": true
   }
   ```
4. 在页面的 `.json` 中引用:
   ```json
   {
     "usingComponents": {
       "my-component": "/components/my-component/index"
     }
   }
   ```

## Adding New Pages

1. 在 `miniprogram/pages/` 中创建目录
2. 创建 4 个文件: `.ts`, `.wxml`, `.wxss`, `.json`
3. 在 `miniprogram/app.json` 的 pages 数组中注册
4. 在 `.ts` 文件中使用 `Component()`

---

**最后更新**: 2026-03-05
**维护者**: Claude Sonnet 4.6
