# plan.md — 微信小程序 TodoList（MVP）实施计划（复核增强版）

## 摘要
在现有微信小程序模板工程上实现 TodoList MVP，采用双页结构（列表页 + 新增页），功能覆盖新增、完成切换、硬删除、本地持久化，并通过仓储接口为未来云开发迁移预留边界。  
本版计划已补齐上个方案的关键遗漏：页面生命周期选型、全局遗留逻辑清理、输入与并发防抖、存储损坏恢复、手工验收路径。

## 对上版计划的遗漏补齐（已纳入实施）
1. 页面刷新机制要明确为 `pageLifetimes.show`（而非模糊写法 `onShow/attached`）。
2. 需要处理模板遗留逻辑：`app.ts` 中示例日志与登录代码应清理为与 Todo 业务一致的最小实现。
3. 需要补充“操作锁”策略，避免快速连点导致重复提交/重复删除。
4. 需要定义存储数据“结构校验 + 自愈写回”流程，防止脏数据导致页面崩溃。
5. 需要明确页面级配置（导航标题）与路由变更后兼容策略（`logs` 文件保留但不注册）。
6. 需要给出可执行的微信开发者工具手工测试矩阵（当前工程无 npm 脚本）。

## 范围与非范围

### In Scope
1. 列表页展示任务与统计（总数/已完成/未完成）。
2. 新增页创建任务（标题必填，`trim` 后 1~100 字）。
3. 列表页切换完成状态并即时持久化。
4. 列表页删除任务（确认弹窗 + 硬删除）。
5. 本地存储持久化与数据自愈。
6. 代码结构预留云迁移接口。

### Out of Scope
1. 编辑任务。
2. 筛选器（全部/进行中/已完成）。
3. 优先级、截止日期、提醒、归档。
4. 云开发真实接入与账号体系。
5. 批量操作。

## 目录与文件变更计划

1. 更新 [app.json](E:/小程序/todulist/miniprogram/app.json)
- 路由改为：
  - `pages/index/index`
  - `pages/task-form/index`
- `window.navigationBarTitleText` 改为 `TodoList`。

2. 改造列表页（覆盖原 index 模板）
- [index.ts](E:/小程序/todulist/miniprogram/pages/index/index.ts)
- [index.wxml](E:/小程序/todulist/miniprogram/pages/index/index.wxml)
- [index.wxss](E:/小程序/todulist/miniprogram/pages/index/index.wxss)
- [index.json](E:/小程序/todulist/miniprogram/pages/index/index.json)

3. 新增任务表单页
- [index.ts](E:/小程序/todulist/miniprogram/pages/task-form/index.ts)
- [index.wxml](E:/小程序/todulist/miniprogram/pages/task-form/index.wxml)
- [index.wxss](E:/小程序/todulist/miniprogram/pages/task-form/index.wxss)
- [index.json](E:/小程序/todulist/miniprogram/pages/task-form/index.json)

4. 新增数据层
- [todo.ts](E:/小程序/todulist/miniprogram/types/todo.ts)
- [todo-repository.ts](E:/小程序/todulist/miniprogram/utils/todo-repository.ts)

5. 清理全局模板噪音
- [app.ts](E:/小程序/todulist/miniprogram/app.ts) 保留最小生命周期骨架，不再写 `logs` 示例数据。

## 公共接口 / 类型 / 数据结构（重要变更）

### 类型定义
```ts
export type TodoItem = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
}
```

### 仓储接口
```ts
export interface TodoRepository {
  list(): TodoItem[]
  create(input: { title: string }): TodoItem
  toggle(id: string): TodoItem | null
  remove(id: string): boolean
}
```

### 本地实现约束
1. `STORAGE_KEY = 'todos:v1'`。
2. `list()` 内执行结构校验；若不合法则返回空数组并写回空数组（自愈）。
3. 排序规则固定为：
- `completed=false` 在前
- 同组按 `createdAt` 倒序
4. `id` 生成策略：`Date.now()` + 随机串，保证本地唯一性。

## 页面行为与数据流（决策锁定）

### 列表页 `pages/index/index`
1. `pageLifetimes.show` 中调用 `reloadTodos()`。
2. `reloadTodos()`：
- `repository.list()` -> `sortTodos()` -> `setData({ todos, stats })`
3. 点击“新增任务”：
- `wx.navigateTo({ url: '/pages/task-form/index' })`
4. 点击完成切换：
- 使用 `dataset.id` 调用 `toggle(id)`，成功后刷新列表。
5. 点击删除：
- `wx.showModal` 二次确认 -> `remove(id)` -> 刷新列表。
6. 操作锁：
- `isBusy` 为 `true` 时忽略重复操作，操作结束恢复。

### 新增页 `pages/task-form/index`
1. 输入框双向更新本地 `title`。
2. 点击保存：
- 若 `isSubmitting=true` 直接返回。
- `trim` + 长度校验（1~100）失败则 `wx.showToast`。
- 成功后 `repository.create({ title })`，再 `wx.navigateBack()`。
3. 点击取消：
- 直接 `wx.navigateBack()`。

## UI/样式约束
1. 使用 `rpx` 为主，避免新增 `px`。
2. 任务完成态使用删除线与弱化颜色。
3. 列表底部统计栏预留 `safe-area`：
- `padding-bottom: calc(24rpx + env(safe-area-inset-bottom));`
4. 空态文案明确可见：“还没有任务，先添加一个吧”。

## 异常与边界处理
1. 存储损坏：读取异常/结构非法时自动回退空数组并覆盖写回。
2. 空标题/全空格/超长：阻止提交，toast 明确提示。
3. 快速连点：新增与删除/切换均受状态锁保护。
4. `id` 不存在：
- `toggle/remove` 返回空结果或 `false`，页面不崩溃，必要时 toast 提示“任务不存在或已变更”。

## 测试用例与场景

### 功能路径
1. 首次进入：空态显示正确。
2. 新增合法任务：列表新增且排序正确。
3. 连续新增 3 条：按时间倒序，未完成均在前。
4. 切换完成：任务移动到“已完成区域”（排序后靠后）。
5. 删除任务：确认后移除且统计同步变化。
6. 退出并重进开发者工具：任务仍能恢复。

### 校验与鲁棒性
1. 输入空字符串与全空格：不可保存。
2. 输入 101 字符：不可保存。
3. 手动污染 `todos:v1`（非数组）：页面可自愈并继续使用。
4. 连续快速点击保存/删除/切换：无重复写入和异常报错。

### 代码规范检查
1. 新增/修改代码注释全部中文。
2. 页面逻辑全部基于 `Component()`。
3. TS 严格模式下无新增类型错误（以微信开发者工具编译结果为准）。

## 实施顺序（供后续编码阶段执行）
1. 先建类型与仓储层（`types` + `utils`）。
2. 改造列表页（渲染、统计、切换、删除、排序）。
3. 新增任务表单页（输入、校验、保存、返回）。
4. 更新 `app.json` 与 `app.ts`。
5. 在微信开发者工具中走完整回归用例。

## 假设与默认值
1. 继续采用 MVP 核心范围，不扩展编辑与筛选。
2. 仍保留 `pages/logs/*` 文件但不注册到路由，避免一次性删除引发额外风险。
3. 数据层先本地实现，未来新增 `CloudTodoRepository` 时保持接口不变。
4. 当前阶段不引入第三方库，不新增 npm 构建链路。
