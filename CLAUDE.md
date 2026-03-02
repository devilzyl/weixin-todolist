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

**无 npm 脚本** - 构建、测试和代码检查由微信开发者工具处理。

## Project Structure

```
todulist/
├── miniprogram/          # 小程序源代码根目录 (miniprogramRoot)
│   ├── app.ts           # 应用入口点 & 生命周期
│   ├── app.json         # 应用配置: 页面、路由、窗口设置
│   ├── app.wxss         # 全局样式
│   ├── pages/           # 页面组件
│   └── utils/           # 工具模块
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

### Page/Component Files

每个页面需要 4 个文件：
- `.ts` - 页面逻辑（基于 Component）
- `.wxml` - 模板（类似 HTML，使用 WXML 语法）
- `.wxss` - 样式（类似 CSS，使用 `rpx` 单位）
- `.json` - 页面配置

**文件扩展名映射：**
| 微信小程序 | Web 标准 |
|-----------|---------|
| `.wxml` | `.html` |
| `.wxss` | `.css` |
| `.ts` | `.js` / TypeScript |
| `.json` | JSON 配置 |

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

## Adding New Pages

1. 在 `miniprogram/pages/` 中创建目录
2. 创建 4 个文件: `.ts`, `.wxml`, `.wxss`, `.json`
3. 在 `miniprogram/app.json` 的 pages 数组中注册
4. 在 `.ts` 文件中使用 `Component()`

---

**最后更新**: 2026-03-02
**维护者**: Claude Sonnet 4.6
