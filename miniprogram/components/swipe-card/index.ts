/**
 * 滑动卡片组件
 *
 * 支持左滑显示操作按钮
 * 提供优先级切换、编辑、删除功能
 */

Component({
  /** 组件属性 */
  properties: {
    /** 任务 ID */
    todoId: {
      type: String,
      required: true,
    },
    /** 任务标题 */
    title: {
      type: String,
      value: '',
    },
  },

  /** 组件数据 */
  data: {
    /** 滑动偏移量 */
    translateX: 0,
    /** 按钮总宽度（px） */
    buttonWidth: 0,
    /** 是否正在滑动 */
    isSwiping: false,
  },

  lifetimes: {
    /**
     * 组件挂载时，按当前设备宽度将 rpx 换算为 px
     * 3 个按钮 * 120rpx = 360rpx
     */
    attached() {
      const windowInfo = wx.getWindowInfo()
      const buttonWidth = (360 * windowInfo.windowWidth) / 750
      this.setData({ buttonWidth })
    },
  },

  /** 组件方法 */
  methods: {
    /**
     * 滑动移动事件
     */
    onMove(e: any) {
      this.setData({ isSwiping: true })

      const x = e.detail.x
      // 限制只能向左滑动
      if (x > 0) return

      // 限制最大滑动距离
      const maxTranslate = -this.data.buttonWidth
      if (x < maxTranslate) return

      // 过滤轻微触摸抖动，避免点击时出现彩色细边
      if (x > -6) {
        this.setData({ translateX: 0 })
        return
      }

      this.setData({ translateX: x })
    },

    /**
     * 触摸结束事件
     */
    onTouchEnd() {
      const { translateX, buttonWidth } = this.data

      // 滑动超过一半，自动展开；否则复位
      if (translateX < -buttonWidth / 2) {
        this.setData({ translateX: -buttonWidth })
      } else {
        this.setData({ translateX: 0 })
      }

      // 延迟重置滑动状态，避免立即触发点击
      setTimeout(() => {
        this.setData({ isSwiping: false })
      }, 100)
    },

    /**
     * 优先级按钮点击
     */
    onPriority(e: any) {
      this.resetPosition()
      this.triggerEvent('priority', { id: e.currentTarget.dataset.id })
    },

    /**
     * 编辑按钮点击
     */
    onEdit(e: any) {
      this.resetPosition()
      this.triggerEvent('edit', {
        id: e.currentTarget.dataset.id,
        title: e.currentTarget.dataset.title
      })
    },

    /**
     * 删除按钮点击
     */
    onDelete(e: any) {
      this.resetPosition()
      this.triggerEvent('delete', { id: e.currentTarget.dataset.id })
    },

    /**
     * 重置滑动位置
     */
    resetPosition() {
      this.setData({ translateX: 0 })
    },
  },
})
