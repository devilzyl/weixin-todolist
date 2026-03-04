/**
 * 数据迁移工具
 * 用于将旧版本数据迁移到新结构
 */

import type { TodoItem } from '../types/todo'

/**
 * 旧版任务数据类型（没有 content 字段）
 */
interface LegacyTodo {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
  updatedAt: number
  // 没有 content 字段
}

/**
 * 迁移任务数据
 * 为缺少 content 字段的任务添加默认值
 *
 * @param todos - 待迁移的任务列表（可能是旧格式或新格式）
 * @returns 迁移后的任务列表
 *
 * @example
 * ```typescript
 * const oldTodos = [
 *   { id: '1', title: '任务1', completed: false, priority: 'low', createdAt: 123, updatedAt: 123 }
 * ]
 * const newTodos = migrateTodoData(oldTodos)
 * // newTodos[0].content === ''
 * ```
 */
export function migrateTodoData(todos: LegacyTodo[] | TodoItem[]): TodoItem[] {
  return todos.map((todo) => {
    // 如果已有 content 字段，直接返回
    if ('content' in todo) {
      return todo as TodoItem
    }

    // 否则添加默认值（空字符串）
    return {
      ...todo,
      content: '',
    } as TodoItem
  })
}

/**
 * 检查数据是否需要迁移
 *
 * @param todos - 任务列表
 * @returns 如果需要迁移返回 true，否则返回 false
 */
export function needsMigration(todos: any[]): boolean {
  if (!Array.isArray(todos) || todos.length === 0) {
    return false
  }

  // 检查第一个任务是否有 content 字段
  const firstTodo = todos[0]
  return firstTodo && typeof firstTodo === 'object' && !('content' in firstTodo)
}
