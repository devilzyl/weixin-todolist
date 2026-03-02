/**
 * 新增任务页面
 *
 * 提供任务标题输入和创建功能
 * 包含输入校验和防抖锁
 */

import { LocalTodoRepository } from '../../utils/todo-repository'

/** 仓储实例 */
const repository = new LocalTodoRepository()

Component({
  /** 页面数据 */
  data: {
    /** 任务标题 */
    title: '',

    /** 提交锁（防止重复提交） */
    isSubmitting: false,
  },

  /** 页面方法 */
  methods: {
    /**
     * 输入框变化事件
     * @param e - 事件对象
     */
    onInputChange(e: any) {
      this.setData({
        title: e.detail.value,
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
      if (title.length > 100) {
        wx.showToast({
          title: '标题不能超过100字',
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
        repository.create({ title })

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
