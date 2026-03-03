/**
 * 任务编辑页面
 *
 * 提供任务标题修改功能
 * 包含输入校验、防重复提交和错误处理
 */

import { LocalTodoRepository } from '../../utils/todo-repository'

/** 仓储实例 */
const repository = new LocalTodoRepository()

Component({
  /** 页面数据 */
  data: {
    /** 任务 ID */
    id: '',

    /** 任务标题 */
    title: '',

    /** 标题长度（用于计数器） */
    titleLength: 0,

    /** 提交锁（防止重复提交） */
    isSubmitting: false,
  },

  /** 页面生命周期 */
  pageLifetimes: {
    /**
     * 页面显示时读取参数
     */
    show() {
      // 从页面参数中获取任务 ID 和标题
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1] as any
      const { id, title } = currentPage.options || {}

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

      // 解码标题（URL 编码）
      const decodedTitle = title ? decodeURIComponent(title) : ''

      // 设置初始数据
      this.setData({
        id,
        title: decodedTitle,
        titleLength: decodedTitle.length,
      })
    },
  },

  /** 页面方法 */
  methods: {
    /**
     * 输入框变化事件
     * @param e - 事件对象
     */
    onInputChange(e: any) {
      const title = e.detail.value
      this.setData({
        title,
        titleLength: title.length,
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
        // 更新任务标题
        const result = repository.updateTitle({
          id: this.data.id,
          title,
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
