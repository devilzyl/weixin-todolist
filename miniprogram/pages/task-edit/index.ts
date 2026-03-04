/**
 * 任务编辑页面
 *
 * 提供任务标题、内容和优先级修改功能
 * 包含输入校验、防重复提交和错误处理
 */

import { LocalTodoRepository } from '../../utils/todo-repository'
import type { TodoPriority } from '../../types/todo'

/** 仓储实例 */
const repository = new LocalTodoRepository()

Component({
  /** 页面数据 */
  data: {
    /** 任务 ID */
    id: '',

    /** 任务标题 */
    title: '',

    /** 任务内容 */
    content: '',

    /** 任务优先级 */
    priority: 'low' as TodoPriority,

    /** 优先级选项 */
    priorityOptions: ['低', '中', '高'],

    /** 当前选中的优先级索引 */
    priorityIndex: 0,

    /** 优先级显示标签 */
    priorityLabel: '低',

    /** 提交锁（防止重复提交） */
    isSubmitting: false,
  },

  /** 页面生命周期 */
  pageLifetimes: {
    /**
     * 页面显示时读取参数和任务数据
     */
    show() {
      // 从页面参数中获取任务 ID 和标题
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1] as any
      const { id } = currentPage.options || {}

      // 参数校验
      if (!id) {
        wx.showToast({
          title: '缺少任务 ID',
          icon: 'none',
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)

        return
      }

      // 从仓储读取任务数据
      const todos = repository.list()
      const task = todos.find((t) => t.id === id)

      if (!task) {
        wx.showToast({
          title: '任务不存在',
          icon: 'none',
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)

        return
      }

      // 优先级映射
      const priorityIndexMap: Record<TodoPriority, number> = {
        low: 0,
        medium: 1,
        high: 2,
      }

      // 设置初始数据
      this.setData({
        id,
        title: task.title,
        content: task.content || '',
        priority: task.priority,
        priorityIndex: priorityIndexMap[task.priority],
        priorityLabel: ['低', '中', '高'][priorityIndexMap[task.priority]],
      })
    },
  },

  /** 页面方法 */
  methods: {
    /**
     * 标题输入
     * @param e - 事件对象
     */
    onTitleInput(e: any) {
      this.setData({
        title: e.detail.value,
      })
    },

    /**
     * 内容输入
     * @param e - 事件对象
     */
    onContentInput(e: any) {
      this.setData({
        content: e.detail.value,
      })
    },

    /**
     * 优先级选择
     * @param e - 事件对象
     */
    onPriorityChange(e: any) {
      const index = parseInt(e.detail.value)
      const priorities: TodoPriority[] = ['low', 'medium', 'high']
      const labels = ['低', '中', '高']

      this.setData({
        priority: priorities[index],
        priorityIndex: index,
        priorityLabel: labels[index],
      })
    },

    /**
     * 保存修改
     */
    handleSave() {
      // 操作锁检查
      if (this.data.isSubmitting) {
        return
      }

      // 标题校验
      const title = this.data.title.trim()

      // 空标题校验
      if (title.length === 0) {
        wx.showToast({
          title: '请输入任务标题',
          icon: 'none',
        })
        return
      }

      // 长度校验
      if (title.length > 50) {
        wx.showToast({
          title: '标题不能超过50字',
          icon: 'none',
        })
        return
      }

      // 内容长度校验
      if (this.data.content.length > 500) {
        wx.showToast({
          title: '内容不能超过500字',
          icon: 'none',
        })
        return
      }

      // 设置提交锁
      this.setData({
        isSubmitting: true,
      })

      try {
        // 更新任务（使用新的 update 方法）
        const result = repository.update({
          id: this.data.id,
          title,
          content: this.data.content.trim(),
          priority: this.data.priority,
        })

        // 结果处理
        if (result) {
          // 成功提示
          wx.showToast({
            title: '修改成功',
            icon: 'success',
          })

          // 延迟返回，确保数据写入
          setTimeout(() => {
            wx.navigateBack()
          }, 300)
        } else {
          // 失败提示
          wx.showToast({
            title: '任务不存在',
            icon: 'none',
          })

          // 延迟返回
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      } catch (error) {
        // 异常提示
        wx.showToast({
          title: '修改失败，请重试',
          icon: 'none',
        })
      } finally {
        // 确保释放锁
        if (this.data.isSubmitting) {
          setTimeout(() => {
            this.setData({
              isSubmitting: false,
            })
          }, 300)
        }
      }
    },

    /**
     * 取消返回
     */
    handleCancel() {
      wx.navigateBack()
    },
  },
})
