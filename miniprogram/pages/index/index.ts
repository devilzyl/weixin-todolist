/**
 * TodoList 列表页
 *
 * 展示任务列表、统计信息
 * 支持任务完成状态切换和删除
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

    /** 统计信息 */
    stats: {
      /** 总数 */
      total: 0,
      /** 已完成数 */
      completed: 0,
      /** 未完成数 */
      active: 0,
    },

    /** 操作锁（防止快速连点） */
    isBusy: false,
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
     * 从仓储读取数据并更新页面状态和统计
     */
    reloadTodos() {
      const todos = repository.list()
      const total = todos.length
      const completed = todos.filter((t) => t.completed).length

      this.setData({
        todos,
        stats: {
          total,
          completed,
          active: total - completed,
        },
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
