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

  /** 任务标题（1-100字符） */
  title: string

  /** 是否完成 */
  completed: boolean

  /** 创建时间戳 */
  createdAt: number

  /** 更新时间戳 */
  updatedAt: number
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
}
