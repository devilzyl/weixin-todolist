/**
 * 优先级色点组件
 *
 * 显示任务优先级的彩色圆点，支持点击切换
 */

Component({
  /**
   * 组件属性
   */
  properties: {
    /** 任务 ID */
    todoId: {
      type: String,
      value: '',
    },

    /** 优先级 */
    priority: {
      type: String,
      value: 'low',
    },

    /** 是否可点击 */
    clickable: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件数据
   */
  data: {
    /** 色点颜色 */
    dotColor: '#8E8E93', // 默认灰色（低优先级）
    /** 色点大小（px） */
    dotSize: 12,
  },

  lifetimes: {
    /**
     * 组件挂载时设置颜色
     */
    attached() {
      this.updateDotColor()
    },
  },

  observers: {
    /**
     * 监听 priority 变化，更新颜色
     */
    'priority': function () {
      this.updateDotColor()
    },
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 更新色点颜色
     */
    updateDotColor() {
      // 颜色映射：根据设计文档要求
      const colorMap = {
        low: '#8E8E93', // 灰色
        medium: '#007AFF', // 蓝色
        high: '#FF3B30', // 红色
      }

      this.setData({
        dotColor: colorMap[this.data.priority as keyof typeof colorMap],
      })
    },

    /**
     * 点击事件处理
     */
    onTap() {
      if (this.data.clickable && this.data.todoId) {
        this.triggerEvent('cycle', {
          id: this.data.todoId,
        })
      }
    },
  },
})
