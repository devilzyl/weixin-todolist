/**
 * Todo 数据仓储实现
 *
 * 提供基于微信本地存储的 Todo 数据持久化功能
 * 包含存储自愈、排序、ID 生成等核心逻辑
 */

import type { TodoItem, TodoRepository } from '../types/todo'
import { DEFAULT_PRIORITY } from '../types/todo'

/** 本地存储键名 */
const STORAGE_KEY = 'todos:v1'

/**
 * 本地 Todo 仓储实现
 */
export class LocalTodoRepository implements TodoRepository {
  /**
   * 获取所有任务列表（已排序）
   * @returns 排序后的任务数组
   */
  list(): TodoItem[] {
    const rawData = this._loadFromStorage()
    const validatedData = this._validateAndHeal(rawData)
    return this._sortTodos(validatedData)
  }

  /**
   * 创建新任务
   * @param input - 包含任务标题的输入对象
   * @returns 新创建的任务对象
   */
  create(input: { title: string }): TodoItem {
    const now = Date.now()
    const newTodo: TodoItem = {
      id: this._generateId(),
      title: input.title,
      completed: false,
      priority: DEFAULT_PRIORITY,
      createdAt: now,
      updatedAt: now,
    }

    const todos = this.list()
    todos.push(newTodo)

    this._saveToStorage(todos)

    return newTodo
  }

  /**
   * 切换任务完成状态
   * @param id - 任务 ID
   * @returns 更新后的任务，不存在时返回 null
   */
  toggle(id: string): TodoItem | null {
    const todos = this.list()
    const todo = todos.find((t) => t.id === id)

    if (!todo) {
      return null
    }

    // 创建新数组避免直接修改 list() 返回的引用
    const newTodos = todos.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          updatedAt: Date.now(),
        }
      }
      return t
    })

    this._saveToStorage(newTodos)

    return newTodos.find((t) => t.id === id)!
  }

  /**
   * 删除任务
   * @param id - 任务 ID
   * @returns 是否成功删除
   */
  remove(id: string): boolean {
    const todos = this.list()
    const originalLength = todos.length

    const filteredTodos = todos.filter((t) => t.id !== id)

    if (filteredTodos.length === originalLength) {
      return false
    }

    this._saveToStorage(filteredTodos)

    return true
  }

  /**
   * 更新任务标题
   * @param input - 包含任务 ID 和新标题的输入对象
   * @returns 更新后的任务，不存在时返回 null
   */
  updateTitle(input: { id: string; title: string }): TodoItem | null {
    const todos = this.list()
    const todo = todos.find((t) => t.id === input.id)

    if (!todo) {
      return null
    }

    // 创建新数组避免直接修改 list() 返回的引用
    const newTodos = todos.map((t) => {
      if (t.id === input.id) {
        return {
          ...t,
          title: input.title,
          updatedAt: Date.now(),
        }
      }
      return t
    })

    this._saveToStorage(newTodos)

    return newTodos.find((t) => t.id === input.id)!
  }

  /**
   * 批量设置所有任务的完成状态
   * @param input - 包含完成状态的输入对象
   * @returns 受影响的任务数量
   */
  markAll(input: { completed: boolean }): number {
    const todos = this.list()
    const now = Date.now()

    // 统计状态会发生变化的任务数量
    const affectedCount = todos.filter((t) => t.completed !== input.completed).length

    // 如果没有需要更新的任务，直接返回
    if (affectedCount === 0) {
      return 0
    }

    // 创建新数组，批量更新状态
    const newTodos = todos.map((t) => ({
      ...t,
      completed: input.completed,
      updatedAt: now,
    }))

    this._saveToStorage(newTodos)

    return affectedCount
  }

  /**
   * 清除所有已完成的任务
   * @returns 删除的任务数量
   */
  clearCompleted(): number {
    const todos = this.list()
    const originalLength = todos.length

    // 过滤掉已完成的任务
    const activeTodos = todos.filter((t) => !t.completed)
    const deletedCount = originalLength - activeTodos.length

    // 如果没有已完成的任务，直接返回
    if (deletedCount === 0) {
      return 0
    }

    this._saveToStorage(activeTodos)

    return deletedCount
  }

  /**
   * 从本地存储加载数据
   * @returns 原始数据或 null
   * @private
   */
  private _loadFromStorage(): any {
    try {
      return wx.getStorageSync(STORAGE_KEY)
    } catch (error) {
      console.error('读取存储失败:', error)
      return null
    }
  }

  /**
   * 保存数据到本地存储
   * @param todos - 任务数组
   * @private
   */
  private _saveToStorage(todos: TodoItem[]): void {
    try {
      wx.setStorageSync(STORAGE_KEY, todos)
    } catch (error) {
      console.error('保存存储失败:', error)
    }
  }

  /**
   * 校验并自愈数据
   * @param rawData - 原始数据
   * @returns 校验后的任务数组
   * @private
   */
  private _validateAndHeal(rawData: any): TodoItem[] {
    // 情况 1：读取失败或数据不存在
    if (rawData === null || rawData === undefined || rawData === '') {
      this._saveToStorage([])
      return []
    }

    // 情况 2：不是数组类型
    if (!Array.isArray(rawData)) {
      console.warn('存储数据格式错误，重置为空数组')
      this._saveToStorage([])
      return []
    }

    // 情况 3：数组元素校验，过滤掉非法项
    const validTodos = rawData
      .filter((item: any) => {
        return (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.completed === 'boolean' &&
          typeof item.createdAt === 'number' &&
          typeof item.updatedAt === 'number'
        )
      })
      .map((item: TodoItem) => this._healItem(item))

    // 如果有非法项被过滤掉，写回清洗后的数据
    if (validTodos.length !== rawData.length) {
      console.warn('清理了非法的任务项')
      this._saveToStorage(validTodos)
    }

    return validTodos as TodoItem[]
  }

  /**
   * 修复单个任务项
   * 为旧数据添加默认优先级
   * @param item - 任务项
   * @returns 修复后的任务项
   * @private
   */
  private _healItem(item: TodoItem): TodoItem {
    // 为旧数据添加默认优先级
    if (!item.priority) {
      return { ...item, priority: DEFAULT_PRIORITY }
    }
    return item
  }

  /**
   * 排序任务列表
   * 排序规则：未完成在前 → 创建时间倒序
   * @param todos - 任务数组
   * @returns 排序后的新任务数组（不修改原数组）
   * @private
   */
  private _sortTodos(todos: TodoItem[]): TodoItem[] {
    // 使用扩展运算符创建新数组，避免修改原数组
    return [...todos].sort((a, b) => {
      // 先按完成状态排序（未完成在前）
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      // 同状态按创建时间倒序（新的在前）
      return b.createdAt - a.createdAt
    })
  }

  /**
   * 生成唯一 ID
   * @returns 唯一 ID 字符串
   * @private
   */
  private _generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
