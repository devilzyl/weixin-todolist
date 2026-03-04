/**
 * 新增任务页面
 *
 * 提供任务标题、内容和优先级输入
 * 包含输入校验和防抖锁
 */

import { LocalTodoRepository } from '../../utils/todo-repository'
import type { TodoPriority } from '../../types/todo'

/** 仓储实例 */
const repository = new LocalTodoRepository()

Component({
  /** 页面数据 */
  data: {
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
     * 保存任务
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
        // 创建任务
        repository.create({
          title,
          content: this.data.content.trim(),
          priority: this.data.priority,
        })

        // 成功提示
        wx.showToast({
          title: '创建成功',
          icon: 'success',
        })

        // 延迟返回，确保数据写入
        setTimeout(() => {
          wx.navigateBack()
        }, 300)
      } catch (error) {
        // 异常提示
        wx.showToast({
          title: '创建失败，请重试',
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
