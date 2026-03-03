/**
 * TodoList 列表页 - 极简版
 *
 * 展示任务列表
 * 支持任务完成状态切换、编辑和删除
 */

import { LocalTodoRepository } from '../../utils/todo-repository'
import type { TodoItem } from '../../types/todo'

/** 仓储实例 */
const repository = new LocalTodoRepository()

Component({
  /** 页面数据 */
  data: {
    /** 任务列表 */
    todos: [] as TodoItem[],

    /** 待完成任务数 */
    pendingCount: 0,

    /** 操作锁（防止快速连点） */
    isBusy: false,

    /** 高亮任务 ID（新增反馈） */
    highlightTodoId: '',
  },

  /** 组件生命周期 */
  lifetimes: {
    /**
     * 组件挂载时加载任务
     */
    attached() {
      this.reloadTodos()
    },
  },

  /** 页面生命周期 */
  pageLifetimes: {
    /**
     * 页面显示时刷新任务列表
     * 从新增页返回时会触发
     */
    show() {
      this.reloadTodos()
    },
  },

  /** 页面方法 */
  methods: {
    /**
     * 重新加载任务列表
     * 从仓储读取数据并更新页面状态
     */
    reloadTodos() {
      const todos = repository.list()

      // 确保 todos 是一个有效的数组
      const validTodos = Array.isArray(todos) ? todos : []

      // 计算待完成任务数
      const pendingCount = validTodos.filter(
        (t) => t && typeof t.completed === 'boolean' && !t.completed
      ).length

      this.setData({
        todos: validTodos,
        pendingCount,
      })
    },

    /**
     * 跳转到新增任务页面
     */
    navigateToCreate() {
      if (this.data.isBusy) {
        return
      }

      wx.navigateTo({
        url: '/pages/task-form/index',
      })
    },

    /**
     * 跳转到任务编辑页面
     * @param e - 事件对象
     */
    navigateToEdit(e: any) {
      if (this.data.isBusy) {
        return
      }

      const { id, title } = e.currentTarget.dataset

      if (!id) {
        return
      }

      // 确保 title 不为 undefined，避免 encodeURIComponent 报错
      const titleParam = title ? encodeURIComponent(title) : ''

      wx.navigateTo({
        url: `/pages/task-edit/index?id=${id}&title=${titleParam}`,
      })
    },

    /**
     * 切换任务完成状态
     * @param e - 事件对象
     */
    handleToggle(e: any) {
      // 操作锁检查
      if (this.data.isBusy) {
        return
      }

      const { id } = e.currentTarget.dataset
      if (!id) {
        return
      }

      // 设置操作锁
      this.setData({
        isBusy: true,
      })

      // 切换状态
      const result = repository.toggle(id)
      if (result === null) {
        wx.showToast({
          title: '任务不存在',
          icon: 'none',
        })
      }

      // 刷新列表
      this.reloadTodos()

      // 延迟释放操作锁，防止快速连点
      setTimeout(() => {
        this.setData({
          isBusy: false,
        })
      }, 300)
    },

    /**
     * 删除任务
     * @param e - 事件对象
     */
    handleDelete(e: any) {
      // 操作锁检查
      if (this.data.isBusy) {
        return
      }

      const { id } = e.currentTarget.dataset
      if (!id) {
        return
      }

      // 二次确认弹窗
      wx.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除这个任务吗？',
        success: (res) => {
          if (res.confirm) {
            // 用户确认删除
            this.setData({
              isBusy: true,
            })

            const success = repository.remove(id)
            if (!success) {
              wx.showToast({
                title: '任务不存在',
                icon: 'none',
              })
            }

            // 刷新列表
            this.reloadTodos()

            // 释放操作锁
            setTimeout(() => {
              this.setData({
                isBusy: false,
              })
            }, 300)
          }
        },
      })
    },
  },
})
