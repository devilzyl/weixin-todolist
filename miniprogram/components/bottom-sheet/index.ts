/**
 * 底部滑出面板组件
 *
 * 从屏幕底部滑出的模态面板，用于显示表单等内容
 */

Component({
  properties: {
    /** 是否显示面板 */
    show: {
      type: Boolean,
      value: false,
    },
    /** 面板标题 */
    title: {
      type: String,
      value: '',
    },
    /** 当前主题 */
    theme: {
      type: String,
      value: 'light',
    },
    /** 模式：edit-编辑模式，add-添加模式 */
    mode: {
      type: String,
      value: 'add',
    },
  },
  data: {
    /** 是否显示动画 */
    animation: false,
  },
  observers: {
    show(val) {
      if (val) {
        setTimeout(() => {
          this.setData({ animation: true })
        }, 50)
      } else {
        this.setData({ animation: false })
      }
    },
  },
  methods: {
    /** 点击遮罩关闭 */
    onMaskTap() {
      this.triggerEvent('close')
    },
    /** 点击保存按钮 */
    onSave() {
      this.triggerEvent('save')
    },
    /** 点击取消按钮关闭（保留以备后用） */
    onCancel() {
      this.triggerEvent('close')
    },
  },
})
