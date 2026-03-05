/**
 * Todo 类型定义
 *
 * 定义 TodoList 应用的核心数据类型和仓储接口
 */

/**
 * Todo 任务实体类型
 */
export type TodoItem = {
  /** 任务唯一标识 */
  id: string

  /** 任务标题（必填，最多50字） */
  title: string

  /** 任务详细内容（可选，最多500字，默认空字符串） */
  content: string

  /** 是否完成 */
  completed: boolean

  /** 创建时间戳 */
  createdAt: number

  /** 更新时间戳 */
  updatedAt: number

  /** 优先级（high: 高 / medium: 中 / low: 低） */
  priority: TodoPriority

  /** 分类（work: 工作 / personal: 个人 / default: 默认） */
  category: TodoCategory
}

/**
 * Todo 仓储接口
 *
 * 定义数据操作的抽象边界，便于未来迁移到云开发
 */
export interface TodoRepository {
  /**
   * 获取所有任务列表（已排序）
   * @returns 排序后的任务数组
   */
  list(): TodoItem[]

  /**
   * 创建新任务
   * @param input - 包含任务标题的输入对象
   * @returns 新创建的任务对象
   */
  create(input: { title: string }): TodoItem

  /**
   * 切换任务完成状态
   * @param id - 任务 ID
   * @returns 更新后的任务，不存在时返回 null
   */
  toggle(id: string): TodoItem | null

  /**
   * 删除任务
   * @param id - 任务 ID
   * @returns 是否成功删除
   */
  remove(id: string): boolean

  /**
   * 更新任务标题
   * @param input - 包含任务 ID 和新标题的输入对象
   * @returns 更新后的任务，不存在时返回 null
   */
  updateTitle(input: { id: string; title: string }): TodoItem | null

  /**
   * 批量设置所有任务的完成状态
   * @param input - 包含完成状态的输入对象
   * @returns 受影响的任务数量
   */
  markAll(input: { completed: boolean }): number

  /**
   * 清除所有已完成的任务
   * @returns 删除的任务数量
   */
  clearCompleted(): number

  /**
   * 切换任务优先级
   * @param id - 任务 ID
   * @returns 更新后的任务，不存在时返回 null
   */
  cyclePriority(id: string): TodoItem | null
}

/**
 * 任务优先级类型
 */
export type TodoPriority = 'high' | 'medium' | 'low'

/**
 * 任务分类类型
 */
export type TodoCategory = 'work' | 'personal' | 'default'

/**
 * 分类配置常量
 */
export const CATEGORY_CONFIG = {
  work: { label: '工作', color: '#ff9500' },
  personal: { label: '个人', color: '#007aff' },
  default: { label: '默认', color: '#86868b' },
} as const

/**
 * 获取分类配置
 * @param category - 分类值
 * @returns 分类配置对象
 */
export function getCategoryConfig(category: TodoCategory) {
  return CATEGORY_CONFIG[category]
}

/**
 * 优先级配置常量
 * 定义每个优先级的标签、图标和颜色
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

/**
 * 默认分类
 */
export const DEFAULT_CATEGORY: TodoCategory = 'default'

/**
 * 获取优先级配置
 * @param priority - 优先级值
 * @returns 优先级配置对象
 */
export function getPriorityConfig(priority: TodoPriority) {
  return PRIORITY_CONFIG[priority]
}
