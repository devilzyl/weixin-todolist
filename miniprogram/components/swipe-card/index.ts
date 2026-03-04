/**
 * 滑动卡片组件
 *
 * 支持左滑显示操作按钮
 * 提供任务展示（标题+内容）、优先级切换、编辑、删除功能
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
    /** 任务内容 */
    content: {
      type: String,
      value: '',
    },
    /** 任务优先级 */
    priority: {
      type: String,
      value: 'low',
    },
    /** 是否展开 */
    isExpanded: {
      type: Boolean,
      value: false,
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
    /** 截断后的内容 */
    truncatedContent: '',
    /** 是否显示展开提示 */
    showExpandHint: false,
  },

  lifetimes: {
    /**
     * 组件挂载时，按当前设备宽度将 rpx 换算为 px
     * 2 个按钮 * 120rpx = 240rpx
     */
    attached() {
      const windowInfo = wx.getWindowInfo()
      const buttonWidth = (240 * windowInfo.windowWidth) / 750 // 只剩编辑和删除按钮
      this.setData({ buttonWidth })
      this.updateContentDisplay()
    },
  },

  observers: {
    'content': function () {
      this.updateContentDisplay()
    },
    'isExpanded': function () {
      // 当展开状态改变时，通知父组件更新全局展开状态
      if (this.data.isExpanded) {
        this.triggerEvent('expand', { id: this.data.todoId })
      }
    },
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
     * 更新内容显示
     * 根据内容长度和展开状态计算显示文本
     */
    updateContentDisplay() {
      const content = this.data.content || ''
      const maxLength = 50 // 约2行文字
      const shouldTruncate = content.length > maxLength && !this.data.isExpanded

      this.setData({
        truncatedContent: shouldTruncate ? content.substring(0, maxLength) : content,
        showExpandHint: content.length > maxLength,
      })
    },

    /**
     * 优先级切换事件
     * 由 priority-dot 组件触发
     */
    handlePriority(e: any) {
      const { id } = e.detail
      this.triggerEvent('priority', { id })
    },

    /**
     * 卡片点击事件处理
     * 实现分区点击：左侧25%切换状态，中间展开/收起
     */
    onCardTap(e: any) {
      // 如果正在滑动，不处理点击
      if (this.data.isSwiping) {
        return
      }

      // 如果已经左滑显示按钮，不处理点击
      if (this.data.translateX < -6) {
        this.resetPosition()
        return
      }

      const touch = e.detail
      if (!touch) {
        return
      }

      // 获取卡片宽度
      const query = this.createSelectorQuery()
      query.select('.swipe-content').boundingClientRect()
      query.exec((res: any) => {
        if (!res || !res[0]) {
          return
        }

        const cardWidth = res[0].width
        // 计算点击位置相对于卡片左边缘的 X 坐标
        const clickX = touch.x - res[0].left
        const clickRatio = clickX / cardWidth

        if (clickRatio < 0.25) {
          // 左侧 25%：切换完成状态
          this.triggerEvent('toggle', { id: this.data.todoId })
        } else if (clickRatio < 0.85) {
          // 中间 60%：展开/收起内容
          this.triggerEvent('toggle-expand', { id: this.data.todoId })
        }
        // 右侧 15%：不处理，由按钮组件处理
      })
    },

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
     * 编辑按钮点击
     */
    onEdit(e: any) {
      this.resetPosition()
      this.triggerEvent('edit', {
        id: e.currentTarget.dataset.id,
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
