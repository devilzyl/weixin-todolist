# TodoList 编辑任务与批量操作 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有 TodoList 小程序中实现任务标题编辑、全部完成/全部取消完成、清除已完成（含二次确认）。

**Architecture:** 扩展 `TodoRepository` 接口与本地仓储实现，页面层仅调用仓储 API。`index` 页增加批量操作栏并处理操作锁；新增 `task-edit` 页面完成标题更新并返回刷新。

**Tech Stack:** WeChat Mini Program (TypeScript + glass-easel), `wx` 本地存储 API

---

### Task 1: 扩展仓储接口定义

**Files:**
- Modify: `E:/小程序/todolist/miniprogram/types/todo.ts`

**Step 1: 写失败“类型用例”**
- 在脑中/草稿先列出调用签名（`updateTitle/markAll/clearCompleted`），确保 `index.ts`、`task-edit.ts` 后续可直接调用。

**Step 2: 修改接口**
- 在 `TodoRepository` 增加：
  - `updateTitle(input: { id: string; title: string }): TodoItem | null`
  - `markAll(input: { completed: boolean }): number`
  - `clearCompleted(): number`

**Step 3: 编译检查（开发者工具）**
- 预期：无新增 TS 接口错误。

**Step 4: Commit**
```bash
git add miniprogram/types/todo.ts
git commit -m "feat: 扩展 Todo 仓储接口支持编辑与批量操作"
```

### Task 2: 实现仓储编辑与批量能力

**Files:**
- Modify: `E:/小程序/todolist/miniprogram/utils/todo-repository.ts`

**Step 1: 写失败用例清单（手工）**
- 编辑不存在 ID 返回 `null`
- 编辑成功更新时间戳
- 全部完成/取消返回受影响数量
- 清除已完成仅删已完成项

**Step 2: 最小实现 `updateTitle`**
- 校验 ID 与标题，找不到返回 `null`
- 命中项更新 `title` + `updatedAt`
- 持久化后返回更新项

**Step 3: 最小实现 `markAll`**
- 按入参批量设置 `completed`
- 更新每条 `updatedAt`
- 返回变更条数并持久化

**Step 4: 最小实现 `clearCompleted`**
- 过滤已完成项
- 返回删除条数并持久化

**Step 5: 手工验证**
- 开发者工具创建若干任务后，通过 console 调用仓储方法验证结果与存储一致。

**Step 6: Commit**
```bash
git add miniprogram/utils/todo-repository.ts
git commit -m "feat: 实现任务编辑与批量操作仓储逻辑"
```

### Task 3: 新增任务编辑页面

**Files:**
- Create: `E:/小程序/todolist/miniprogram/pages/task-edit/index.ts`
- Create: `E:/小程序/todolist/miniprogram/pages/task-edit/index.wxml`
- Create: `E:/小程序/todolist/miniprogram/pages/task-edit/index.wxss`
- Create: `E:/小程序/todolist/miniprogram/pages/task-edit/index.json`
- Modify: `E:/小程序/todolist/miniprogram/app.json`

**Step 1: 写失败交互用例（手工）**
- 进入编辑页未带 id 时提示并返回
- 空标题/超长禁止保存
- 保存成功后返回列表页

**Step 2: 实现页面逻辑**
- `onLoad` 读取 `id` 和原标题
- `onInputChange` 更新输入
- `handleSave` 调用 `repository.updateTitle`
- 保留 `isSubmitting` 防重复提交

**Step 3: 实现页面结构样式**
- 输入框 + 计数器 + 取消/保存按钮
- 风格与 `task-form` 一致

**Step 4: 注册路由**
- 在 `app.json` 的 `pages` 增加 `pages/task-edit/index`

**Step 5: 手工验证**
- 从 URL 带参数进入编辑页测试保存与异常提示。

**Step 6: Commit**
```bash
git add miniprogram/pages/task-edit miniprogram/app.json
git commit -m "feat: 新增任务编辑页面"
```

### Task 4: 列表页接入编辑入口

**Files:**
- Modify: `E:/小程序/todolist/miniprogram/pages/index/index.wxml`
- Modify: `E:/小程序/todolist/miniprogram/pages/index/index.ts`
- Modify: `E:/小程序/todolist/miniprogram/pages/index/index.wxss`

**Step 1: 写失败交互用例（手工）**
- 点击编辑入口能跳转且带 `id/title`
- 快速连点不重复跳转（`isBusy`）

**Step 2: 增加编辑按钮**
- 每个任务项增加编辑入口（避免与 toggle/delete 冲突）

**Step 3: 增加跳转方法**
- `navigateToEdit(e)`，读取 dataset 并 `wx.navigateTo`

**Step 4: 手工验证**
- 编辑后返回列表自动刷新，统计无异常。

**Step 5: Commit**
```bash
git add miniprogram/pages/index/index.*
git commit -m "feat: 列表页接入任务编辑入口"
```

### Task 5: 列表页接入批量操作栏

**Files:**
- Modify: `E:/小程序/todolist/miniprogram/pages/index/index.wxml`
- Modify: `E:/小程序/todolist/miniprogram/pages/index/index.ts`
- Modify: `E:/小程序/todolist/miniprogram/pages/index/index.wxss`

**Step 1: 写失败交互用例（手工）**
- 空列表时批量按钮禁用
- 全部完成/全部取消完成生效
- 清除已完成必须经过确认框

**Step 2: 增加批量操作 UI**
- 顶部操作栏三个按钮：
  - `全部完成`
  - `全部取消完成`
  - `清除已完成`

**Step 3: 实现方法**
- `handleMarkAllCompleted()`
- `handleMarkAllActive()`
- `handleClearCompleted()`（`wx.showModal` 确认）
- 全程使用 `isBusy` 锁，结束后 `reloadTodos()`

**Step 4: 增加提示文案**
- 无可操作目标时 toast（如“暂无已完成任务”）

**Step 5: 手工验证**
- 多任务混合状态下执行三类批量操作，核对列表与统计。

**Step 6: Commit**
```bash
git add miniprogram/pages/index/index.*
git commit -m "feat: 列表页新增批量操作能力"
```

### Task 6: 回归与文档更新

**Files:**
- Modify: `E:/小程序/todolist/README.md`

**Step 1: 回归清单**
- 创建、编辑、单条切换、单条删除、全部完成、全部取消完成、清除已完成。
- 页面返回刷新与操作锁行为。

**Step 2: 更新 README**
- 增加新功能说明与使用路径。

**Step 3: Commit**
```bash
git add README.md
git commit -m "docs: 更新编辑与批量操作功能说明"
```
