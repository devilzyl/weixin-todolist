# 微信小程序 TodoList MVP - 详细实施计划

## 一、项目现状分析

### 当前项目结构
```
E:/小程序/todolist/
├── miniprogram/               # 小程序主目录
│   ├── app.ts                # 全局应用入口（含示例代码需清理）
│   ├── app.json              # 全局配置（需更新路由和标题）
│   ├── app.wxss              # 全局样式
│   ├── pages/
│   │   ├── index/            # 列表页位置（需完全改造）
│   │   │   ├── index.ts      # 当前是用户信息示例
│   │   │   ├── index.wxml    # 当前是用户信息模板
│   │   │   ├── index.wxss    # 样式文件
│   │   │   └── index.json    # 页面配置
│   │   └── logs/             # 日志页（保留文件但不注册路由）
│   ├── utils/
│   │   └── util.ts           # 时间格式化工具（保留）
│   └── [待创建] types/       # 类型定义目录
└── typings/types/            # 全局类型声明
```

### 关键发现
1. **使用 Component() 构造器**：index.ts 已使用 `Component()`，符合 plan.md 要求
2. **TS 严格模式已启用**：tsconfig.json 已配置严格检查
3. **无 types 目录**：需要在 `miniprogram/` 下创建
4. **app.ts 有示例代码**：需要清理 logs 和登录相关逻辑
5. **glass-easel 组件框架**：app.json 中已声明

---

## 二、实施步骤（按优先级排序）

### 阶段一：数据层基础（Foundation）

#### 步骤 1.1：创建类型定义
**文件**：`miniprogram/types/todo.ts`

**内容**：
```typescript
/**
 * Todo 任务实体类型
 */
export type TodoItem = {
  id: string              // 任务唯一标识
  title: string           // 任务标题（1-100字符）
  completed: boolean      // 是否完成
  createdAt: number       // 创建时间戳
  updatedAt: number       // 更新时间戳
}

/**
 * Todo 仓储接口
 * 定义数据操作的抽象边界，便于未来迁移到云开发
 */
export interface TodoRepository {
  /** 获取所有任务列表（已排序） */
  list(): TodoItem[]

  /** 创建新任务 */
  create(input: { title: string }): TodoItem

  /** 切换任务完成状态，返回更新后的任务或 null（不存在时） */
  toggle(id: string): TodoItem | null

  /** 删除任务，返回是否成功 */
  remove(id: string): boolean
}
```

---

#### 步骤 1.2：实现本地存储仓储
**文件**：`miniprogram/utils/todo-repository.ts`

**核心功能**：
1. **常量定义**：`STORAGE_KEY = 'todos:v1'`
2. **list() 方法**：读取存储 → 结构校验 → 排序（未完成在前 → 时间倒序）
3. **create() 方法**：生成 ID → 创建对象 → 写入存储
4. **toggle() 方法**：查找 → 切换状态 → 更新时间 → 写回
5. **remove() 方法**：过滤 → 写回 → 返回是否成功
6. **存储自愈**：异常时返回空数组并覆盖写回

---

### 阶段二：列表页开发（List Page）

#### 步骤 2.1：改造列表页逻辑
**文件**：`miniprogram/pages/index/index.ts`

**核心方法**：
- `reloadTodos()`：重新加载任务列表并更新统计
- `navigateToCreate()`：跳转到新增任务页面
- `handleToggle(e)`：切换任务完成状态（带操作锁）
- `handleDelete(e)`：删除任务（带二次确认弹窗）

**数据结构**：
```typescript
data: {
  todos: [] as TodoItem[],
  stats: { total: 0, completed: 0, active: 0 },
  isBusy: false  // 操作锁
}
```

**生命周期**：
- `lifetimes.attached()`：初始化时加载任务
- `pageLifetimes.show()`：页面显示时刷新任务

---

#### 步骤 2.2：设计列表页模板
**文件**：`miniprogram/pages/index/index.wxml`

**结构**：
- 统计栏：显示全部/已完成/未完成数量
- 任务列表：支持空态展示
- 任务项：checkbox + 标题 + 删除按钮
- 底部栏：新增任务按钮 + 安全区域

---

#### 步骤 2.3：编写列表页样式
**文件**：`miniprogram/pages/index/index.wxss`

**设计要点**：
- 使用 `rpx` 单位
- 完成态：删除线 + 弱化颜色
- 底部安全区域：`env(safe-area-inset-bottom)`

---

#### 步骤 2.4：配置列表页
**文件**：`miniprogram/pages/index/index.json`

```json
{
  "navigationBarTitleText": "TodoList",
  "usingComponents": {}
}
```

---

### 阶段三：新增页开发（Form Page）

#### 步骤 3.1：创建新增页目录
创建 `miniprogram/pages/task-form/` 目录及四个文件

---

#### 步骤 3.2：实现新增页逻辑
**文件**：`miniprogram/pages/task-form/index.ts`

**核心功能**：
- 双向绑定输入
- 提交校验（trim 后 1~100 字）
- 防抖锁（isSubmitting）
- 成功后导航返回

---

#### 步骤 3.3：设计新增页模板
**文件**：`miniprogram/pages/task-form/index.wxml`

**结构**：
- 表单区域：任务标题输入框 + 字数统计
- 操作区域：取消按钮 + 保存按钮

---

#### 步骤 3.4：编写新增页样式
**文件**：`miniprogram/pages/task-form/index.wxss`

---

#### 步骤 3.5：配置新增页
**文件**：`miniprogram/pages/task-form/index.json`

```json
{
  "navigationBarTitleText": "新增任务",
  "usingComponents": {}
}
```

---

### 阶段四：全局配置清理（Global Config）

#### 步骤 4.1：更新 app.json
**文件**：`miniprogram/app.json`

**变更点**：
1. 更新 `pages` 数组：
   ```json
   "pages": [
     "pages/index/index",
     "pages/task-form/index"
   ]
   ```
2. 更新 `window.navigationBarTitleText`：
   ```json
   "navigationBarTitleText": "TodoList"
   ```

---

#### 步骤 4.2：清理 app.ts
**文件**：`miniprogram/app.ts`

移除 logs 相关示例代码和登录逻辑，保留最小生命周期骨架。

---

## 三、数据流说明

### 1. 冷启动流程
```
应用启动 → app.ts onLaunch() → 加载列表页 → attached() → reloadTodos() → 显示空态
```

### 2. 新增任务流程
```
点击新增 → 跳转表单页 → 输入标题 → 保存 → repository.create() → navigateBack() → pageLifetimes.show() → 刷新列表
```

### 3. 切换完成状态流程
```
点击任务 → handleToggle() → 设置操作锁 → repository.toggle() → reloadTodos() → 释放操作锁
```

### 4. 删除任务流程
```
点击删除 → showModal 确认 → repository.remove() → reloadTodos() → 释放操作锁
```

### 5. 存储自愈流程
```
读取存储 → 校验结构 → 非法时返回空数组 → 覆盖写回 → 继续运行
```

---

## 四、验收标准

### 功能验收

#### ✅ 列表展示
- [ ] 首次进入显示空态文案："还没有任务，先添加一个吧"
- [ ] 统计栏正确显示：全部、已完成、未完成数量

#### ✅ 新增任务
- [ ] 点击"新增任务"按钮跳转到新增页
- [ ] 输入框支持最多 100 字，显示字数统计
- [ ] 点击"取消"返回列表页
- [ ] 空标题（全空格）无法保存，显示 Toast 提示
- [ ] 超过 100 字无法保存，显示 Toast 提示
- [ ] 合法标题保存成功后自动返回列表
- [ ] 新增任务出现在列表顶部（未完成区域）

#### ✅ 切换完成状态
- [ ] 点击任务项切换完成状态
- [ ] 完成的任务显示删除线，颜色变淡
- [ ] 完成的任务移动到列表底部
- [ ] 统计数字实时更新
- [ ] 快速连续点击只触发一次操作（操作锁生效）

#### ✅ 删除任务
- [ ] 点击"删除"显示确认弹窗
- [ ] 弹窗标题："确认删除"
- [ ] 点击"取消"关闭弹窗，不删除
- [ ] 点击"确定"删除任务，统计更新
- [ ] 删除最后一条任务后显示空态
- [ ] 快速连续点击只触发一次操作

#### ✅ 数据持久化
- [ ] 新增任务后关闭小程序，重新打开任务仍存在
- [ ] 切换状态后重启，状态保持
- [ ] 删除后重启，不再出现

### 鲁棒性验收

#### ✅ 输入校验
- [ ] 输入纯空格无法保存
- [ ] 输入 101 字符无法保存
- [ ] 输入 Emoji 正常保存和显示

#### ✅ 存储自愈
- [ ] 手动修改存储为非法值后刷新，显示空态，不崩溃
- [ ] 后续可正常使用

#### ✅ 并发防护
- [ ] 快速双击"保存"按钮只创建一条任务
- [ ] 快速双击"删除"按钮只删除一次
- [ ] 快速双击任务项只切换一次状态

### 代码规范验收

#### ✅ 注释规范
- [ ] 所有新增文件使用中文注释
- [ ] 文件头部有功能说明
- [ ] 复杂逻辑有行内注释

#### ✅ Git 提交
- [ ] 提交消息使用中文
- [ ] feat 类型使用中文描述（如 `feat: 实现列表页功能`）

#### ✅ TypeScript
- [ ] 无类型错误（微信开发者工具编译通过）
- [ ] 使用严格模式，无 `any` 类型

---

## 五、手工测试路径

### 测试环境
- **工具**：微信开发者工具
- **操作**：直接在工具中点击"编译"

### 测试矩阵

| 场景 | 操作步骤 | 预期结果 |
|------|---------|---------|
| 冷启动 | 打开小程序 | 显示空态，统计 0/0/0 |
| 新增1条 | 点击新增 → 输入"测试" → 保存 | 返回列表，显示1条，统计 1/0/1 |
| 新增3条 | 连续新增3条任务 | 按时间倒序，新任务在前 |
| 切换完成 | 点击第1条任务 | 该任务移到底部，统计更新 |
| 切换回未完成 | 再次点击该任务 | 该任务移到顶部，统计更新 |
| 删除任务 | 点击某条"删除" → 确认 | 任务消失，统计更新 |
| 删除取消 | 点击"删除" → 取消 | 任务仍存在 |
| 空标题 | 新增页直接点保存 | Toast 提示"请输入任务标题" |
| 空格标题 | 输入5个空格 → 保存 | Toast 提示"请输入任务标题" |
| 超长标题 | 输入101字 → 保存 | Toast 提示"标题不能超过100字" |
| 快速连点 | 快速双击"保存" | 只创建一条任务 |
| 存储恢复 | 新增任务 → 关闭重开 | 任务仍存在 |
| 存储自愈 | 污染存储 → 刷新 | 显示空态，不崩溃 |

---

## 六、实施时间估算

| 阶段 | 任务 | 预估时间 |
|------|-----|---------|
| 1 | 创建类型定义 | 10 分钟 |
| 1 | 实现仓储层 | 30 分钟 |
| 2 | 列表页逻辑 | 30 分钟 |
| 2 | 列表页模板 | 20 分钟 |
| 2 | 列表页样式 | 20 分钟 |
| 3 | 新增页逻辑 | 20 分钟 |
| 3 | 新增页模板 | 15 分钟 |
| 3 | 新增页样式 | 15 分钟 |
| 4 | 更新全局配置 | 10 分钟 |
| 5 | 手工测试与修复 | 60 分钟 |
| **总计** | | **约 3 小时** |

---

## 七、关键文件清单

实施此计划时，以下 5 个文件最为关键：

1. **`miniprogram/utils/todo-repository.ts`** - 核心数据层
2. **`miniprogram/pages/index/index.ts`** - 主列表页逻辑
3. **`miniprogram/pages/task-form/index.ts`** - 新增任务页逻辑
4. **`miniprogram/types/todo.ts`** - 类型定义
5. **`miniprogram/app.json`** - 路由配置

---

**创建时间**：2026-03-02
**基于**：plan.md
**状态**：待审核
