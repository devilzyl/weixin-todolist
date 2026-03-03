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
    /** 滑动偏移量（px） */
    translateX: 0,
    /** 按钮总宽度（px） */
    buttonWidth: 0,
    /** 是否正在滑动 */
    isSwiping: false,
    /** 触摸起点 X */
    touchStartX: 0,
    /** 触摸起点 Y */
    touchStartY: 0,
    /** 触摸开始时的偏移量 */
    startTranslateX: 0,
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
     * 触摸开始
     */
    onTouchStart(e: any) {
      const touch = e.touches && e.touches[0]
      if (!touch) return

      this.setData({
        touchStartX: touch.clientX,
        touchStartY: touch.clientY,
        startTranslateX: this.data.translateX,
        isSwiping: false,
      })
    },

    /**
     * 触摸移动
     */
    onTouchMove(e: any) {
      const touch = e.touches && e.touches[0]
      if (!touch) return

      const deltaX = touch.clientX - this.data.touchStartX
      const deltaY = touch.clientY - this.data.touchStartY

      // 纵向滚动优先
      if (!this.data.isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }

      const rawX = this.data.startTranslateX + deltaX
      const nextX = Math.max(-this.data.buttonWidth, Math.min(0, rawX))

      // 过滤轻微抖动，避免点击时露出彩线
      if (nextX > -6) {
        this.setData({
          isSwiping: true,
          translateX: 0,
        })
        return
      }

      this.setData({
        isSwiping: true,
        translateX: nextX,
      })
    },

    /**
     * 触摸结束
     */
    onTouchEnd() {
      const { translateX, buttonWidth } = this.data

      // 滑动超过一半，自动展开；否则复位
      if (translateX < -buttonWidth / 2) {
        this.setData({ translateX: -buttonWidth })
      } else {
        this.setData({ translateX: 0 })
      }

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
        title: e.currentTarget.dataset.title,
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
